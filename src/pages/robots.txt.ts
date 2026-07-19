import type { APIRoute } from "astro";
import { site as siteData } from "../data/site";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(siteData.url);
  const sitemapUrl = new URL("/sitemap.xml", baseUrl);
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${sitemapUrl}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};
