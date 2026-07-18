import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const distRoot = path.join(projectRoot, "dist");
const serviceWorkerPath = path.join(distRoot, "sw.js");
const precacheExtensions = new Set([".html", ".css", ".js", ".webmanifest"]);
const precacheAssets = new Set([
  "assets/campus-hero.png",
  "icons/apple-touch-icon.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png"
]);

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : entryPath;
    })
  );

  return files.flat();
};

const toRelativePath = (filePath) =>
  path.relative(distRoot, filePath).split(path.sep).join("/");

const toPublicUrl = (relativePath) => {
  if (relativePath === "index.html") {
    return "/";
  }

  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }

  return `/${relativePath}`;
};

const replaceBetweenMarkers = (source, startMarker, endMarker, replacement) => {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error(`Service Worker 缺少构建标记：${startMarker} / ${endMarker}`);
  }

  const contentStart = startIndex + startMarker.length;
  return `${source.slice(0, contentStart)}\n${replacement}\n  ${source.slice(endIndex)}`;
};

const allFiles = await listFiles(distRoot);
const precacheFiles = allFiles
  .map((filePath) => ({ filePath, relativePath: toRelativePath(filePath) }))
  .filter(
    ({ relativePath }) =>
      relativePath !== "sw.js" &&
      (precacheExtensions.has(path.extname(relativePath)) || precacheAssets.has(relativePath))
  )
  .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

const precacheUrls = [...new Set(precacheFiles.map(({ relativePath }) => toPublicUrl(relativePath)))].sort(
  (left, right) => (left === "/" ? -1 : right === "/" ? 1 : left.localeCompare(right))
);

const versionHash = createHash("sha256");
for (const { filePath, relativePath } of precacheFiles) {
  versionHash.update(relativePath);
  versionHash.update(await readFile(filePath));
}

const cacheVersion = versionHash.digest("hex").slice(0, 12);
const startMarker = "/* __PRECACHE_URLS_START__ */";
const endMarker = "/* __PRECACHE_URLS_END__ */";
const urlLines = precacheUrls.map((url, index) => {
  const suffix = index === precacheUrls.length - 1 ? "" : ",";
  return `  ${JSON.stringify(url)}${suffix}`;
});

let serviceWorker = await readFile(serviceWorkerPath, "utf8");
serviceWorker = serviceWorker.replace(
  /const CACHE_VERSION = "dev"; \/\/ __CACHE_VERSION__/,
  `const CACHE_VERSION = ${JSON.stringify(cacheVersion)}; // __CACHE_VERSION__`
);
serviceWorker = replaceBetweenMarkers(serviceWorker, startMarker, endMarker, urlLines.join("\n"));

await writeFile(serviceWorkerPath, serviceWorker, "utf8");
console.log(`[pwa] 已生成 ${precacheUrls.length} 项预缓存，版本 ${cacheVersion}`);
