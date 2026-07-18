import { createHash, randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, serialize } from "parse5";
import subsetFont from "subset-font";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const distRoot = path.join(projectRoot, "dist");
const fontSourcePath = path.join(
  projectRoot,
  "node_modules",
  "@openfonts",
  "noto-sans-sc_chinese-simplified",
  "files",
  "noto-sans-sc-chinese-simplified-400.woff2"
);
const fontOutputRoot = path.join(distRoot, "assets", "fonts");
const cipherFamily = "ClassMemoryCipher";
const puaStart = 0xe000;
const puaEnd = 0xf8ff;
const skippedElements = new Set([
  "code",
  "head",
  "noscript",
  "pre",
  "script",
  "style",
  "template",
  "textarea"
]);
const isHan = (character) => /\p{Script=Han}/u.test(character);

const listHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listHtmlFiles(entryPath)
        : entry.isFile() && entry.name.endsWith(".html")
          ? [entryPath]
          : [];
    })
  );

  return files.flat();
};

const visitTextNodes = (node, visitor, isSkipped = false) => {
  const skipChildren = isSkipped || (node.tagName && skippedElements.has(node.tagName));

  if (node.nodeName === "#text" && !skipChildren) {
    visitor(node);
    return;
  }

  for (const child of node.childNodes ?? []) {
    visitTextNodes(child, visitor, skipChildren);
  }
};

const seededRandom = (seed) => {
  let counter = 0;
  return () => {
    const digest = createHash("sha256")
      .update(seed)
      .update(String(counter++))
      .digest();
    return digest.readUInt32BE(0) / 0x1_0000_0000;
  };
};

const createCipherMap = (characters) => {
  if (characters.length > puaEnd - puaStart + 1) {
    throw new Error(`待加密字符 ${characters.length} 个，超过 BMP 私用区容量。`);
  }

  const puaCodes = Array.from(
    { length: puaEnd - puaStart + 1 },
    (_, index) => puaStart + index
  );
  const buildSeed = process.env.FONT_ENCRYPTION_SEED || randomBytes(32).toString("hex");
  const random = seededRandom(buildSeed);

  for (let index = puaCodes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [puaCodes[index], puaCodes[swapIndex]] = [puaCodes[swapIndex], puaCodes[index]];
  }

  return new Map(
    characters.map((character, index) => [character, String.fromCodePoint(puaCodes[index])])
  );
};

const readSfntTables = (fontBuffer) => {
  const tableCount = fontBuffer.readUInt16BE(4);
  const tables = [];

  for (let index = 0; index < tableCount; index += 1) {
    const recordOffset = 12 + index * 16;
    const tag = fontBuffer.toString("ascii", recordOffset, recordOffset + 4);
    const offset = fontBuffer.readUInt32BE(recordOffset + 8);
    const length = fontBuffer.readUInt32BE(recordOffset + 12);
    tables.push({ tag, data: Buffer.from(fontBuffer.subarray(offset, offset + length)) });
  }

  return tables;
};

const readCmapGlyphMap = (fontBuffer, characters) => {
  const cmapTable = readSfntTables(fontBuffer).find((table) => table.tag === "cmap");
  if (!cmapTable) throw new Error("字体缺少 cmap 字符映射表。 ");

  const cmap = cmapTable.data;
  const recordCount = cmap.readUInt16BE(2);
  const subtableOffsets = new Set();

  for (let index = 0; index < recordCount; index += 1) {
    subtableOffsets.add(cmap.readUInt32BE(4 + index * 8 + 4));
  }

  const subtables = [...subtableOffsets]
    .map((offset) => ({ offset, format: cmap.readUInt16BE(offset) }))
    .filter(({ format }) => format === 4 || format === 12)
    .sort((left, right) => right.format - left.format);

  const readFormat4Glyph = (offset, codePoint) => {
    if (codePoint > 0xffff) return 0;
    const segmentCount = cmap.readUInt16BE(offset + 6) / 2;
    const endCodesOffset = offset + 14;
    const startCodesOffset = endCodesOffset + segmentCount * 2 + 2;
    const deltasOffset = startCodesOffset + segmentCount * 2;
    const rangeOffsetsOffset = deltasOffset + segmentCount * 2;

    for (let index = 0; index < segmentCount; index += 1) {
      const start = cmap.readUInt16BE(startCodesOffset + index * 2);
      const end = cmap.readUInt16BE(endCodesOffset + index * 2);
      if (codePoint < start || codePoint > end) continue;

      const delta = cmap.readInt16BE(deltasOffset + index * 2);
      const rangeOffsetPosition = rangeOffsetsOffset + index * 2;
      const rangeOffset = cmap.readUInt16BE(rangeOffsetPosition);
      if (rangeOffset === 0) return (codePoint + delta) & 0xffff;

      const glyphPosition = rangeOffsetPosition + rangeOffset + (codePoint - start) * 2;
      if (glyphPosition + 2 > cmap.length) return 0;
      const glyph = cmap.readUInt16BE(glyphPosition);
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }

    return 0;
  };

  const readFormat12Glyph = (offset, codePoint) => {
    const groupCount = cmap.readUInt32BE(offset + 12);
    let low = 0;
    let high = groupCount - 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const groupOffset = offset + 16 + middle * 12;
      const start = cmap.readUInt32BE(groupOffset);
      const end = cmap.readUInt32BE(groupOffset + 4);
      if (codePoint < start) high = middle - 1;
      else if (codePoint > end) low = middle + 1;
      else return cmap.readUInt32BE(groupOffset + 8) + codePoint - start;
    }

    return 0;
  };

  const glyphMap = new Map();
  for (const character of characters) {
    const codePoint = character.codePointAt(0);
    for (const subtable of subtables) {
      const glyph =
        subtable.format === 12
          ? readFormat12Glyph(subtable.offset, codePoint)
          : readFormat4Glyph(subtable.offset, codePoint);
      if (glyph > 0) {
        glyphMap.set(character, glyph);
        break;
      }
    }
  }

  return glyphMap;
};

const buildCipherCmap = (cipherMap, glyphMap) => {
  const entries = [...cipherMap.entries()]
    .map(([original, encrypted]) => ({
      codePoint: encrypted.codePointAt(0),
      glyph: glyphMap.get(original)
    }))
    .sort((left, right) => left.codePoint - right.codePoint);
  entries.push({ codePoint: 0xffff, glyph: 0 });

  const segmentCount = entries.length;
  const subtableLength = 16 + segmentCount * 8;
  const cmap = Buffer.alloc(20 + subtableLength);
  cmap.writeUInt16BE(0, 0);
  cmap.writeUInt16BE(2, 2);
  cmap.writeUInt16BE(0, 4);
  cmap.writeUInt16BE(3, 6);
  cmap.writeUInt32BE(20, 8);
  cmap.writeUInt16BE(3, 12);
  cmap.writeUInt16BE(1, 14);
  cmap.writeUInt32BE(20, 16);

  const subtableOffset = 20;
  const entrySelector = Math.floor(Math.log2(segmentCount));
  const searchRange = 2 * 2 ** entrySelector;
  cmap.writeUInt16BE(4, subtableOffset);
  cmap.writeUInt16BE(subtableLength, subtableOffset + 2);
  cmap.writeUInt16BE(0, subtableOffset + 4);
  cmap.writeUInt16BE(segmentCount * 2, subtableOffset + 6);
  cmap.writeUInt16BE(searchRange, subtableOffset + 8);
  cmap.writeUInt16BE(entrySelector, subtableOffset + 10);
  cmap.writeUInt16BE(segmentCount * 2 - searchRange, subtableOffset + 12);

  const endCodesOffset = subtableOffset + 14;
  const startCodesOffset = endCodesOffset + segmentCount * 2 + 2;
  const deltasOffset = startCodesOffset + segmentCount * 2;
  const rangeOffsetsOffset = deltasOffset + segmentCount * 2;
  entries.forEach(({ codePoint, glyph }, index) => {
    cmap.writeUInt16BE(codePoint, endCodesOffset + index * 2);
    cmap.writeUInt16BE(codePoint, startCodesOffset + index * 2);
    cmap.writeUInt16BE((glyph - codePoint) & 0xffff, deltasOffset + index * 2);
    cmap.writeUInt16BE(0, rangeOffsetsOffset + index * 2);
  });

  return cmap;
};

const calculateChecksum = (buffer) => {
  const paddedLength = Math.ceil(buffer.length / 4) * 4;
  const padded = Buffer.alloc(paddedLength);
  buffer.copy(padded);
  let checksum = 0;
  for (let offset = 0; offset < padded.length; offset += 4) {
    checksum = (checksum + padded.readUInt32BE(offset)) >>> 0;
  }
  return checksum;
};

const replaceSfntTable = (fontBuffer, tag, replacement) => {
  const tables = readSfntTables(fontBuffer)
    .filter((table) => table.tag !== "DSIG")
    .map((table) => ({ ...table, data: table.tag === tag ? replacement : table.data }));
  const head = tables.find((table) => table.tag === "head");
  if (!head) throw new Error("字体缺少 head 表。 ");
  head.data.writeUInt32BE(0, 8);

  const tableCount = tables.length;
  const entrySelector = Math.floor(Math.log2(tableCount));
  const searchRange = 16 * 2 ** entrySelector;
  const headerLength = 12 + tableCount * 16;
  let fontLength = headerLength;
  for (const table of tables) fontLength += Math.ceil(table.data.length / 4) * 4;

  const output = Buffer.alloc(fontLength);
  fontBuffer.copy(output, 0, 0, 4);
  output.writeUInt16BE(tableCount, 4);
  output.writeUInt16BE(searchRange, 6);
  output.writeUInt16BE(entrySelector, 8);
  output.writeUInt16BE(tableCount * 16 - searchRange, 10);

  let dataOffset = headerLength;
  let headOffset = 0;
  tables.forEach((table, index) => {
    const recordOffset = 12 + index * 16;
    output.write(table.tag, recordOffset, 4, "ascii");
    output.writeUInt32BE(calculateChecksum(table.data), recordOffset + 4);
    output.writeUInt32BE(dataOffset, recordOffset + 8);
    output.writeUInt32BE(table.data.length, recordOffset + 12);
    table.data.copy(output, dataOffset);
    if (table.tag === "head") headOffset = dataOffset;
    dataOffset += Math.ceil(table.data.length / 4) * 4;
  });

  const adjustment = (0xb1b0afba - calculateChecksum(output)) >>> 0;
  output.writeUInt32BE(adjustment, headOffset + 8);
  return output;
};

const injectFontLoader = (html, fontUrl) => {
  const loader = [
    `<link rel="preload" href="${fontUrl}" as="font" type="font/woff2" crossorigin>`,
    `<style data-font-encryption>@font-face{font-family:"${cipherFamily}";src:url("${fontUrl}") format("woff2");font-style:normal;font-weight:100 900;font-display:block}</style>`
  ].join("");

  if (!html.includes("</head>")) {
    throw new Error("构建页面缺少 </head>，无法注入加密字体。 ");
  }

  return html.replace("</head>", `${loader}</head>`);
};

const htmlFiles = await listHtmlFiles(distRoot);
if (htmlFiles.length === 0) {
  throw new Error("dist 中没有 HTML 文件，请先执行 Astro 构建。 ");
}

const pages = await Promise.all(
  htmlFiles.map(async (filePath) => {
    const source = await readFile(filePath, "utf8");
    return { filePath, document: parse(source) };
  })
);

const requestedCharacters = new Set();
for (const page of pages) {
  visitTextNodes(page.document, (node) => {
    for (const character of node.value) {
      if (isHan(character)) requestedCharacters.add(character);
    }
  });
}

const sourceFontBuffer = await readFile(fontSourcePath);
const subsetFontBuffer = await subsetFont(sourceFontBuffer, [...requestedCharacters].join(""), {
  targetFormat: "sfnt"
});
const glyphMap = readCmapGlyphMap(subsetFontBuffer, requestedCharacters);
const availableCharacters = new Set(glyphMap.keys());
const cipherMap = createCipherMap([...availableCharacters].sort());
const encryptedSfnt = replaceSfntTable(
  subsetFontBuffer,
  "cmap",
  buildCipherCmap(cipherMap, glyphMap)
);
const encryptedText = [...cipherMap.values()].join("");
const encryptedFont = await subsetFont(encryptedSfnt, encryptedText, {
  targetFormat: "woff2"
});
const verificationSfnt = await subsetFont(encryptedFont, encryptedText, {
  targetFormat: "sfnt"
});
const verifiedGlyphs = readCmapGlyphMap(verificationSfnt, cipherMap.values());
if (verifiedGlyphs.size !== cipherMap.size) {
  throw new Error(
    `加密字体校验失败：缺少 ${cipherMap.size - verifiedGlyphs.size} 个映射字形。`
  );
}

const fontHash = createHash("sha256").update(encryptedFont).digest("hex").slice(0, 12);
const fontFileName = `class-memory-cipher.${fontHash}.woff2`;
const fontUrl = `/assets/fonts/${fontFileName}`;

await mkdir(fontOutputRoot, { recursive: true });
await writeFile(path.join(fontOutputRoot, fontFileName), encryptedFont);

let replacementCount = 0;
for (const page of pages) {
  visitTextNodes(page.document, (node) => {
    node.value = [...node.value]
      .map((character) => {
        const encrypted = cipherMap.get(character);
        if (encrypted) replacementCount += 1;
        return encrypted ?? character;
      })
      .join("");
  });

  const encryptedHtml = injectFontLoader(serialize(page.document), fontUrl);
  await writeFile(page.filePath, encryptedHtml, "utf8");
}

const missingCharacters = [...requestedCharacters].filter(
  (character) => !availableCharacters.has(character)
);
console.log(
  `[font-encryption] 已处理 ${pages.length} 个页面、${availableCharacters.size} 个汉字、${replacementCount} 处文本，字体 ${Math.ceil(encryptedFont.length / 1024)} KiB。`
);
if (missingCharacters.length > 0) {
  console.warn(
    `[font-encryption] 源字体缺少 ${missingCharacters.length} 个汉字（${missingCharacters.join("、")}），已保留原文。`
  );
}
