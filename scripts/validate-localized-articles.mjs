import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const articleDirectory = path.join(projectRoot, "gzhh");
const articles = JSON.parse(
  await readFile(path.join(projectRoot, "src", "data", "articles.generated.json"), "utf8")
);
const markdownFiles = (await readdir(articleDirectory)).filter((fileName) => fileName.endsWith(".md"));
const errors = [];
const localReferences = new Set();

for (const fileName of markdownFiles) {
  const markdown = await readFile(path.join(articleDirectory, fileName), "utf8");
  if (/!\[[^\]]*\]\(https?:\/\//.test(markdown)) {
    errors.push(`${fileName}: contains a remote image`);
  }
  if (/<img\b[^>]+src=["']https?:\/\//i.test(markdown)) {
    errors.push(`${fileName}: contains a remote HTML image`);
  }
  if (/\[[^\]]+\]\(https?:\/\//.test(markdown) || /<a\b[^>]+href=["']https?:\/\//i.test(markdown)) {
    errors.push(`${fileName}: contains an external hyperlink`);
  }
  for (const match of markdown.matchAll(/!\[[^\]]*\]\((\/assets\/article-images\/[^\s\)]+)\)/g)) {
    localReferences.add(match[1]);
  }
  for (const match of markdown.matchAll(/<img\b[^>]+src=["'](\/assets\/article-images\/[^"']+)["']/gi)) {
    localReferences.add(match[1]);
  }
}

for (const localReference of localReferences) {
  try {
    await access(path.join(projectRoot, "public", localReference.replace(/^\//, "")));
  } catch {
    errors.push(`missing local image: ${localReference}`);
  }
}

for (const article of articles) {
  if (!markdownFiles.includes(article.fileName)) errors.push(`missing Markdown: ${article.fileName}`);
  if (!article.path?.startsWith("/articles/") || !article.path.endsWith("/")) {
    errors.push(`${article.fileName}: invalid local path`);
  }
  if ("sourceUrl" in article || "coverSourceUrl" in article) {
    errors.push(`${article.fileName}: generated data still exposes an external source URL`);
  }
  if (article.cover && !localReferences.has(article.cover)) {
    errors.push(`${article.fileName}: generated cover is not referenced by its localized article`);
  }
}

if (articles.length !== markdownFiles.length) {
  errors.push(`article count mismatch: ${articles.length} records for ${markdownFiles.length} Markdown files`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify({
      articles: articles.length,
      localImageReferences: localReferences.size,
      externalHyperlinks: 0,
      remoteImages: 0
    })
  );
}
