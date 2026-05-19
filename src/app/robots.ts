import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://tes-stone.vercel.app/sitemap.xml",
    host: "https://tes-stone.vercel.app",
  };
}
