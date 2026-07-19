import { articles } from "../src/data/articles";
import { people } from "../src/data/people";
import { photoTopics } from "../src/data/photos";
import { timeline } from "../src/data/timeline";

interface SearchDocument {
  id: string;
  type: "时间线" | "照片" | "文章" | "同学";
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  year?: number;
  timestamp?: number;
  url: string;
  image?: string;
}

const collectionName = process.env.PUBLIC_TYPESENSE_COLLECTION || "class_memories";
const host = process.env.PUBLIC_TYPESENSE_HOST?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const port = process.env.PUBLIC_TYPESENSE_PORT || "443";
const protocol = process.env.PUBLIC_TYPESENSE_PROTOCOL || "https";
const adminKey = process.env.TYPESENSE_ADMIN_API_KEY;

if (!host || !adminKey) {
  throw new Error(
    "缺少 Typesense 配置。请设置 PUBLIC_TYPESENSE_HOST 和 TYPESENSE_ADMIN_API_KEY。"
  );
}

const origin = `${protocol}://${host}${
  (protocol === "https" && port === "443") || (protocol === "http" && port === "80")
    ? ""
    : `:${port}`
}`;

const schema = {
  name: collectionName,
  fields: [
    { name: "title", type: "string", locale: "zh" },
    { name: "content", type: "string", locale: "zh" },
    { name: "type", type: "string", facet: true },
    { name: "category", type: "string", facet: true, optional: true },
    { name: "tags", type: "string[]", facet: true, optional: true },
    { name: "year", type: "int32", facet: true, optional: true },
    { name: "timestamp", type: "int64", optional: true },
    { name: "url", type: "string", index: false },
    { name: "image", type: "string", index: false, optional: true }
  ]
};

const slugify = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const getYear = (value: string) => Number(value.match(/\d{4}/)?.[0]) || undefined;

const toTimestamp = (value: string) => {
  const timestamp = Date.parse(`${value}T00:00:00+08:00`);
  return Number.isNaN(timestamp) ? undefined : Math.floor(timestamp / 1000);
};

const documents: SearchDocument[] = [
  ...timeline.map((moment, index) => ({
    id: `timeline-${index + 1}-${slugify(moment.title)}`,
    type: "时间线" as const,
    title: moment.title,
    content: `${moment.date} ${moment.text}`,
    category: "高中三年",
    tags: ["时间线", moment.title],
    year: getYear(moment.date),
    url: "/timeline/"
  })),
  ...photoTopics.flatMap((topic) =>
    topic.photos.map((photo, index) => ({
      id: `photo-${topic.slug}-${index + 1}`,
      type: "照片" as const,
      title: photo.title,
      content: `${topic.title} ${photo.caption}`,
      category: topic.title,
      tags: ["照片", topic.title],
      url: `/gallery/${topic.slug}/`,
      image: photo.image
    }))
  ),
  ...articles.map((article, index) => ({
    id: `article-${index + 1}-${slugify(article.fileName)}`,
    type: "文章" as const,
    title: article.title,
    content: article.excerpt,
    category: article.category,
    tags: ["公众号", article.category],
    year: getYear(article.date),
    timestamp: toTimestamp(article.date),
    url: article.path,
    image: article.cover
  })),
  ...people.map((person) => ({
    id: `person-${person.slug}`,
    type: "同学" as const,
    title: person.name,
    content: [person.location, person.school, person.direction, person.text, person.currentStatus]
      .filter(Boolean)
      .join(" "),
    category: person.direction,
    tags: person.keywords,
    url: `/people/${person.slug}/`,
    image: person.photo || undefined
  }))
];

const request = (path: string, init: RequestInit = {}) =>
  fetch(`${origin}${path}`, {
    ...init,
    headers: {
      "X-TYPESENSE-API-KEY": adminKey,
      ...init.headers
    }
  });

const ensureCollection = async () => {
  const response = await request(`/collections/${encodeURIComponent(collectionName)}`);
  if (response.ok) return;
  if (response.status !== 404) {
    throw new Error(`读取集合失败：${response.status} ${await response.text()}`);
  }

  const createResponse = await request("/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schema)
  });
  if (!createResponse.ok) {
    throw new Error(`创建集合失败：${createResponse.status} ${await createResponse.text()}`);
  }
};

const sync = async () => {
  await ensureCollection();

  const payload = documents.map((document) => JSON.stringify(document)).join("\n");
  const response = await request(
    `/collections/${encodeURIComponent(collectionName)}/documents/import?action=upsert`,
    {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: payload
    }
  );

  if (!response.ok) {
    throw new Error(`导入失败：${response.status} ${await response.text()}`);
  }

  const results = (await response.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { success: boolean; error?: string; document?: string });
  const failures = results.filter((result) => !result.success);

  if (failures.length > 0) {
    failures.slice(0, 10).forEach((failure) => console.error(failure.error, failure.document));
    throw new Error(`${failures.length} 条搜索文档同步失败。`);
  }

  console.log(`已同步 ${results.length} 条文档到 Typesense 集合 ${collectionName}。`);
};

await sync();
