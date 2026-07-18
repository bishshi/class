import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(projectRoot, "gzhh");
const outputDirectory = path.join(projectRoot, ".tmp", "gzhh-images", "raw");
const manifestPath = path.join(projectRoot, ".tmp", "gzhh-images", "manifest.json");
const concurrency = 8;
const maxBytes = 20 * 1024 * 1024;

const extensionByType = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"]
]);

const markdownFiles = (await readdir(sourceDirectory)).filter((name) => name.endsWith(".md"));
const imageMap = new Map();

for (const source of markdownFiles) {
  const markdown = await readFile(path.join(sourceDirectory, source), "utf8");
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g)) {
    const alt = match[1].trim();
    const url = match[2].replaceAll("&amp;", "&").replaceAll("\\_", "_");
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.hostname !== "mmbiz.qpic.cn") continue;
    const existing = imageMap.get(parsed.href) ?? { url: parsed.href, sources: [], alts: [] };
    if (!existing.sources.includes(source)) existing.sources.push(source);
    if (alt && !existing.alts.includes(alt)) existing.alts.push(alt);
    imageMap.set(parsed.href, existing);
  }
}

await mkdir(outputDirectory, { recursive: true });

const entries = [...imageMap.values()];
const results = new Array(entries.length);
const contentFiles = new Map();
let cursor = 0;
let completed = 0;

const download = async (entry, index) => {
  try {
    const response = await fetch(entry.url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ClassArchive/1.0)",
        referer: "https://mp.weixin.qq.com/"
      },
      signal: AbortSignal.timeout(45_000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
    if (!contentType.startsWith("image/")) throw new Error(`Unexpected content type: ${contentType || "unknown"}`);
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > maxBytes) throw new Error(`Image exceeds ${maxBytes} bytes`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > maxBytes) throw new Error(`Image exceeds ${maxBytes} bytes`);
    const hash = createHash("sha256").update(buffer).digest("hex");
    const extension = extensionByType.get(contentType) ?? ".img";
    let file = contentFiles.get(hash);
    let duplicate = true;
    if (!file) {
      duplicate = false;
      file = `${String(index + 1).padStart(4, "0")}-${hash.slice(0, 12)}${extension}`;
      await writeFile(path.join(outputDirectory, file), buffer);
      contentFiles.set(hash, file);
    }
    return { ...entry, status: "ok", file, contentType, bytes: buffer.byteLength, hash, duplicate };
  } catch (error) {
    return { ...entry, status: "error", error: error instanceof Error ? error.message : String(error) };
  }
};

const worker = async () => {
  while (true) {
    const index = cursor++;
    if (index >= entries.length) return;
    results[index] = await download(entries[index], index);
    completed += 1;
    if (completed % 50 === 0 || completed === entries.length) {
      console.log(`Downloaded ${completed}/${entries.length}`);
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, () => worker()));
await writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");

const successful = results.filter((item) => item.status === "ok");
console.log(
  JSON.stringify({
    references: entries.length,
    successful: successful.length,
    failed: results.length - successful.length,
    uniqueContent: successful.filter((item) => !item.duplicate).length,
    bytes: successful.filter((item) => !item.duplicate).reduce((sum, item) => sum + item.bytes, 0),
    manifest: path.relative(projectRoot, manifestPath)
  })
);
