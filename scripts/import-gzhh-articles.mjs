import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(projectRoot, "gzhh");
const outputFile = path.join(projectRoot, "src", "data", "articles.generated.json");

const cleanMarkdown = (value) =>
  value
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[*_`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getExcerpt = (body, title) => {
  const ignored = /(?:data:image|%3Csvg|transform=|阅读|点赞|分享|推荐|留言|2024届612|font-family|__bottom-bar__|sns_opr_btn|picture_content|page_content)/i;
  const lines = body
    .split(/\r?\n/)
    .map((line) => cleanMarkdown(line))
    .filter((line) => {
      if (!line || line === "(unknown)" || line === cleanMarkdown(title) || ignored.test(line)) return false;
      if (/^(?:原创|原文地址|图\d+|内容来自|[=\-]{3,})/.test(line)) return false;
      return /[\p{L}\p{N}]/u.test(line);
    });
  const excerptText = lines[0]?.length >= 32 ? lines[0] : lines.slice(0, 3).join(" ");
  return excerptText.length > 88 ? `${excerptText.slice(0, 88)}…` : excerptText;
};

const getTitle = (raw, fileName) => {
  const heading = raw.match(/\r?\n([^\r\n]{2,120})\r?\n={3,}\r?\n/);
  const title = heading?.[1]?.trim();
  return title && title !== "(unknown)"
    ? title
    : fileName.replace(/\.md$/i, "").replaceAll("_", " ");
};

const getCategory = (title) => {
  if (/毕业|高考|成人礼|壮行|远足|百日誓师|教师风采|班级之星|612|陆壹贰|往年今日/.test(title)) {
    return /毕业|高考|成人礼|壮行/.test(title) ? "毕业时刻" : "班级记忆";
  }
  if (/考试|四六级|四.六级|CET|竞赛|考生|准考证|成绩|普通话|数学建模|挂科|重修|招生/.test(title)) {
    return "考试升学";
  }
  if (/春节|元旦|除夕|小年|圣诞|清明|父亲节|母亲节|儿童节|六一|五四|新年/.test(title)) {
    return "节日来信";
  }
  if (/通知|通告|说明|提醒|返校|课程表|网站|公众号|AI功能|招聘|邀请函/.test(title)) {
    return "校园通知";
  }
  return "班级记忆";
};

const parseArticle = (fileName, raw) => {
  const title = getTitle(raw, fileName);
  const date = raw.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1] ?? "";
  const sourceUrl = raw.match(/原文地址:\s*\[?((?:https?:\/\/)?mp\.weixin\.qq\.com\/s\/[^\s\]\)]+)/)?.[1]
    ?.replaceAll("\\_", "_") ?? "";
  const contentStart = raw.search(/>\s*原文地址:/);
  const body = contentStart >= 0 ? raw.slice(contentStart).split(/\r?\n/).slice(2).join("\n") : raw;
  const images = [...body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s\)]+)\)/g)]
    .map((match) => match[1])
    .filter((url) => /mmbiz\.qpic\.cn/.test(url));
  const excerptText = getExcerpt(body, title);

  return {
    title,
    date,
    displayDate: date ? date.replaceAll("-", ".") : "日期待补",
    sourceUrl,
    cover: images[0] ?? "",
    excerpt: excerptText.length > 88 ? `${excerptText.slice(0, 88)}…` : excerptText || "一页从公众号找回的班级记录。",
    category: getCategory(title),
    fileName
  };
};

const fileNames = (await readdir(sourceDirectory)).filter((fileName) => fileName.endsWith(".md"));
const articles = (
  await Promise.all(
    fileNames.map(async (fileName) => parseArticle(fileName, await readFile(path.join(sourceDirectory, fileName), "utf8")))
  )
)
  .filter((article) => article.sourceUrl)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "zh-CN"));

await writeFile(outputFile, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
console.log(`Imported ${articles.length} articles from gzhh into ${path.relative(projectRoot, outputFile)}.`);
