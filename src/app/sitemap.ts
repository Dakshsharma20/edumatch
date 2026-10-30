import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { listInstitutes, listTutors } from "@/lib/data/listings";

/** Static pages plus published, NON-demo listings. Demo records are noindex and excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/find-coaching", "/find-tutors", "/how-it-works", "/for-institutes", "/for-tutors", "/pricing", "/contact", "/privacy", "/terms"];
  const pages: MetadataRoute.Sitemap = paths.map((p) => ({ url: `${siteConfig.url}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
  const [institutes, tutors] = await Promise.all([listInstitutes(), listTutors()]);
  return [
    ...pages,
    ...institutes.filter((i) => !i.isDemo).map((i) => ({ url: `${siteConfig.url}/coaching/${i.slug}`, lastModified: i.lastUpdated })),
    ...tutors.filter((t) => !t.isDemo).map((t) => ({ url: `${siteConfig.url}/tutors/${t.slug}`, lastModified: t.lastUpdated })),
  ];
}
