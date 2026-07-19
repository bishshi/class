import type { APIRoute } from "astro";
import { people } from "../data/people";
import { photoTopics } from "../data/photos";
import { site as siteData } from "../data/site";

export const prerender = true;

const staticRoutes = [
  "/",
  "/timeline/",
  "/gallery/",
  "/articles/",
  "/people/",
  "/map/",
  "/exam/",
  "/messages/",
  "/anniversary/"
];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(siteData.url);
  const routes = [
    ...staticRoutes,
    ...photoTopics.map((topic) => `/gallery/${topic.slug}/`),
    ...people.map((person) => `/people/${person.slug}/`)
  ];
  const urls = [...new Set(routes)]
    .map((route) => `  <url><loc>${escapeXml(new URL(route, baseUrl).toString())}</loc></url>`)
    .join("\n");
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    ""
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
