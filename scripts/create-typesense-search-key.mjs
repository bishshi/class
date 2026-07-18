import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const collectionName = process.env.PUBLIC_TYPESENSE_COLLECTION || "class_memories";
const host = process.env.PUBLIC_TYPESENSE_HOST?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const port = process.env.PUBLIC_TYPESENSE_PORT || "443";
const protocol = process.env.PUBLIC_TYPESENSE_PROTOCOL || "https";
const adminKey = process.env.TYPESENSE_ADMIN_API_KEY;
const existingSearchKey = process.env.PUBLIC_TYPESENSE_SEARCH_API_KEY;
const force = process.argv.includes("--force");

if (!host || !adminKey) {
  throw new Error(
    "缺少 Typesense 配置。请在 .env 或 .env.local 中设置 PUBLIC_TYPESENSE_HOST 和 TYPESENSE_ADMIN_API_KEY。"
  );
}

const isPlaceholder = (value) =>
  !value || /replace|example|your|请填写|只读密钥/i.test(value);

if (!isPlaceholder(existingSearchKey) && !force) {
  throw new Error(
    "PUBLIC_TYPESENSE_SEARCH_API_KEY 已存在。如需轮换密钥，请执行 npm run search:key -- --force。"
  );
}

const origin = `${protocol}://${host}${
  (protocol === "https" && port === "443") || (protocol === "http" && port === "80")
    ? ""
    : `:${port}`
}`;

const response = await fetch(`${origin}/keys`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-TYPESENSE-API-KEY": adminKey
  },
  body: JSON.stringify({
    description: `Search-only key for ${collectionName}`,
    actions: ["documents:search"],
    collections: [collectionName]
  })
});

const responseText = await response.text();
if (!response.ok) {
  throw new Error(`创建只读密钥失败：${response.status} ${responseText}`);
}

const result = JSON.parse(responseText);
if (!result.value) {
  throw new Error("Typesense 没有返回完整密钥，无法保存配置。请检查服务端响应。" );
}

const envLocalPath = fileURLToPath(new URL("../.env.local", import.meta.url));
let envLocal = "";
try {
  envLocal = await readFile(envLocalPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const lineEnding = envLocal.includes("\r\n") ? "\r\n" : "\n";
const assignment = `PUBLIC_TYPESENSE_SEARCH_API_KEY=${JSON.stringify(result.value)}`;

if (/^PUBLIC_TYPESENSE_SEARCH_API_KEY=.*$/m.test(envLocal)) {
  envLocal = envLocal.replace(/^PUBLIC_TYPESENSE_SEARCH_API_KEY=.*$/m, assignment);
} else {
  const separator = envLocal.length === 0 || envLocal.endsWith("\n") ? "" : lineEnding;
  envLocal = `${envLocal}${separator}${assignment}${lineEnding}`;
}

await writeFile(envLocalPath, envLocal, "utf8");

console.log(`已创建仅限 ${collectionName} 的 documents:search 密钥。`);
console.log(`密钥 ID：${result.id}，已写入 .env.local。`);
console.log("现在可以执行 npm run search:sync 和 npm run build。");
