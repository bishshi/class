export type ArticleCategory = "班级记忆" | "毕业时刻" | "节日来信" | "考试升学" | "校园通知";

export interface WechatArticle {
  title: string;
  date: string;
  displayDate: string;
  sourceUrl: string;
  cover: string;
  coverSourceUrl?: string;
  excerpt: string;
  category: ArticleCategory;
  fileName: string;
}

import articleData from "./articles.generated.json";

export const articles = articleData as WechatArticle[];

export const articleCategories: ArticleCategory[] = [
  "班级记忆",
  "毕业时刻",
  "节日来信",
  "考试升学",
  "校园通知"
];

export const featuredArticles = articles.slice(0, 3);
