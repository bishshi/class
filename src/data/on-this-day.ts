import { articles } from "./articles";
import { photoTopics } from "./photos";
import { timeline } from "./timeline";

export type MemoryKind = "event" | "photo" | "article";

export interface OnThisDayMemory {
  id: string;
  date: string;
  monthDay: string;
  year: number;
  kind: MemoryKind;
  kindLabel: string;
  title: string;
  text: string;
  href: string;
  image?: string;
  external?: boolean;
}

const kindLabels: Record<MemoryKind, string> = {
  event: "班级事件",
  photo: "旧照片",
  article: "旧文章"
};

const toIsoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const getTimelineDates = (label: string) => {
  const match = label.match(/(\d{4})年(\d{1,2})月([^日]+)日/);
  if (!match) return [];

  const [, yearText, monthText, dayText] = match;
  return dayText
    .split(/[、,，]/)
    .map((value) => Number(value.match(/\d+/)?.[0]))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 31)
    .map((day) => toIsoDate(Number(yearText), Number(monthText), day));
};

const createMemory = (
  memory: Omit<OnThisDayMemory, "monthDay" | "year" | "kindLabel">
): OnThisDayMemory => ({
  ...memory,
  monthDay: memory.date.slice(5),
  year: Number(memory.date.slice(0, 4)),
  kindLabel: kindLabels[memory.kind]
});

const eventMemories = timeline.flatMap((moment, momentIndex) =>
  getTimelineDates(moment.date).map((date) =>
    createMemory({
      id: `event-${momentIndex}-${date}`,
      date,
      kind: "event",
      title: moment.title,
      text: moment.text,
      href: "href" in moment && typeof moment.href === "string" ? moment.href : "/timeline/"
    })
  )
);

const photoMemories = photoTopics.flatMap((topic) =>
  topic.photos.flatMap((photo, photoIndex) =>
    photo.date
      ? [
          createMemory({
            id: `photo-${topic.slug}-${photoIndex}-${photo.date}`,
            date: photo.date,
            kind: "photo",
            title: photo.title,
            text: photo.caption,
            href: `/gallery/${topic.slug}/`,
            image: photo.image
          })
        ]
      : []
  )
);

const articleMemories = articles.map((article, articleIndex) =>
  createMemory({
    id: `article-${articleIndex}-${article.date}`,
    date: article.date,
    kind: "article",
    title: article.title,
    text: article.excerpt,
    href: article.path,
    image: article.cover,
    external: false
  })
);

const kindOrder: Record<MemoryKind, number> = {
  event: 0,
  photo: 1,
  article: 2
};

export const onThisDayMemories = [...eventMemories, ...photoMemories, ...articleMemories].sort(
  (left, right) => right.year - left.year || kindOrder[left.kind] - kindOrder[right.kind]
);
