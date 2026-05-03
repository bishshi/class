import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const issueBody = process.env.ISSUE_BODY ?? "";
const topicRoot = resolve(process.env.PHOTO_TOPIC_ROOT ?? "src/data/photo-topics");

const fields = ["topic", "title", "caption", "image", "cover"];
const requiredFields = ["topic", "title", "caption", "image"];
const sectionAliases = new Map(fields.map((field) => [field.toLowerCase(), field]));

function normalizeValue(value) {
  const trimmed = value.trim();
  return trimmed === "_No response_" ? "" : trimmed;
}

function parseIssueForm(body) {
  const result = {};
  const sectionPattern = /^###\s+(.+?)\s*$/gm;
  const matches = [...body.matchAll(sectionPattern)];

  for (let index = 0; index < matches.length; index += 1) {
    const rawLabel = matches[index][1].trim().toLowerCase();
    const field = sectionAliases.get(rawLabel);
    if (!field) continue;

    const start = matches[index].index + matches[index][0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    result[field] = normalizeValue(body.slice(start, end));
  }

  return result;
}

function assertValidInput(input) {
  for (const field of requiredFields) {
    if (!input[field]) {
      throw new Error(`Issue form is missing required field: ${field}`);
    }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.topic)) {
    throw new Error("topic must use lowercase letters, numbers, and single hyphens only.");
  }
}

function topicPathFromSlug(slug) {
  return resolve(topicRoot, `${slug}.ts`);
}

function readTopicModule(filePath) {
  const source = readFileSync(filePath, "utf8");
  const declarationPattern = /export const\s+(\w+)\s*:\s*PhotoTopic\s*=\s*({[\s\S]*?});\s*$/;
  const match = source.match(declarationPattern);

  if (!match) {
    throw new Error(`Could not find PhotoTopic export in ${relative(process.cwd(), filePath)}`);
  }

  const [, exportName, objectSource] = match;
  const topic = Function(`return (${objectSource});`)();
  return { exportName, topic };
}

function buildPhoto(input, existing = {}) {
  return {
    title: input.title || existing.title || "",
    caption: input.caption || existing.caption || "",
    image: input.image || existing.image || ""
  };
}

function quote(value) {
  return JSON.stringify(value);
}

function formatPhoto(photo) {
  return `    {
      title: ${quote(photo.title)},
      caption: ${quote(photo.caption)},
      image: ${quote(photo.image)}
    }`;
}

function formatTopicModule(exportName, topic) {
  return `import type { PhotoTopic } from "../photo-types";

export const ${exportName}: PhotoTopic = {
  slug: ${quote(topic.slug)},
  title: ${quote(topic.title)},
  text: ${quote(topic.text)},
  cover: ${quote(topic.cover ?? "")},
  photos: [
${topic.photos.map(formatPhoto).join(",\n")}
  ]
};
`;
}

const input = parseIssueForm(issueBody);
assertValidInput(input);

const topicPath = topicPathFromSlug(input.topic);
const { exportName, topic } = readTopicModule(topicPath);

if (topic.slug !== input.topic) {
  throw new Error(`Topic slug mismatch: issue asked for ${input.topic}, file contains ${topic.slug}`);
}

if (input.cover) {
  topic.cover = input.cover;
}

const existingIndex = topic.photos.findIndex((photo) => photo.title === input.title);
if (existingIndex >= 0) {
  topic.photos[existingIndex] = buildPhoto(input, topic.photos[existingIndex]);
  console.log(`Updated existing photo "${input.title}" in topic: ${input.topic}`);
} else {
  topic.photos.push(buildPhoto(input));
  console.log(`Added new photo "${input.title}" to topic: ${input.topic}`);
}

writeFileSync(topicPath, formatTopicModule(exportName, topic), "utf8");
console.log(`Wrote ${relative(process.cwd(), topicPath)}`);
