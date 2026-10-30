import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/student/", "/institute/", "/tutor/", "/admin/", "/onboarding", "/login", "/register", "/reset-password", "/auth/"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
