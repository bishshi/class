import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const peoplePath = resolve(process.env.PEOPLE_PATH ?? "src/data/people.ts");
const issueBody = process.env.ISSUE_BODY ?? "";

const fields = [
  "slug",
  "initial",
  "name",
  "photo",
  "location",
  "school",
  "direction",
  "keywords",
  "text",
  "currentStatus",
  "highlight",
  "toPastSelf",
  "messageToClass",
  "favoriteMemory",
  "contact"
];

const requiredFields = [
  "slug",
  "initial",
  "name",
  "location",
  "school",
  "direction",
  "keywords",
  "text",
  "currentStatus",
  "highlight",
  "toPastSelf",
  "messageToClass",
  "favoriteMemory"
];

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

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    throw new Error("slug must use lowercase letters, numbers, and single hyphens only.");
  }
}

function readPeopleModule(filePath) {
  const source = readFileSync(filePath, "utf8");
  const executable = source
    .replace("export const peopleIntro =", "const peopleIntro =")
    .replace("export const people =", "const people =");

  return Function(`${executable}; return { peopleIntro, people };`)();
}

function splitKeywords(value) {
  return value
    .split(/[、,，]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function buildPerson(input, existing = {}) {
  const person = { ...existing };

  for (const field of fields) {
    if (field === "keywords") continue;
    if (input[field] || !(field in person)) {
      person[field] = input[field] ?? "";
    }
  }

  if (input.keywords) {
    person.keywords = splitKeywords(input.keywords);
  } else if (!Array.isArray(person.keywords)) {
    person.keywords = [];
  }

  return person;
}

function quote(value) {
  return JSON.stringify(value);
}

function formatPerson(person) {
  return `  {
    slug: ${quote(person.slug)},
    initial: ${quote(person.initial)},
    name: ${quote(person.name)},
    photo: ${quote(person.photo ?? "")},
    location: ${quote(person.location)},
    school: ${quote(person.school)},
    direction: ${quote(person.direction)},
    keywords: [${person.keywords.map(quote).join(", ")}],
    text: ${quote(person.text)},
    currentStatus: ${quote(person.currentStatus)},
    highlight: ${quote(person.highlight)},
    toPastSelf: ${quote(person.toPastSelf)},
    messageToClass: ${quote(person.messageToClass)},
    favoriteMemory: ${quote(person.favoriteMemory)},
    contact: ${quote(person.contact ?? "")}
  }`;
}

function formatPeopleModule(peopleIntro, people) {
  return `export const peopleIntro = {
  title: ${quote(peopleIntro.title)},
  text: ${quote(peopleIntro.text)}
};

export const people = [
${people.map(formatPerson).join(",\n")}
];
`;
}

const input = parseIssueForm(issueBody);
assertValidInput(input);

const { peopleIntro, people } = readPeopleModule(peoplePath);
const existingIndex = people.findIndex((person) => person.slug === input.slug);

if (existingIndex >= 0) {
  people[existingIndex] = buildPerson(input, people[existingIndex]);
  console.log(`Updated existing person: ${input.slug}`);
} else {
  people.push(buildPerson(input));
  console.log(`Added new person: ${input.slug}`);
}

writeFileSync(peoplePath, formatPeopleModule(peopleIntro, people), "utf8");
console.log(`Wrote ${relative(process.cwd(), peoplePath)}`);
