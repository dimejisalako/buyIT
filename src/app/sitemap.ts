import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/signup", "/login", "/terms", "/privacy"].map((path) => ({ url: base + path }));
}
