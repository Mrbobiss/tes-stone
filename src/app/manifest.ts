import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "T'es stone ?",
    short_name: "T'es stone ?",
    description: "Prends un selfie, choisis ta ref, et découvre jusqu'où ton regard a quitté la conversation.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#fffaf5",
    lang: "fr",
    orientation: "portrait",
    categories: ["lifestyle", "entertainment", "utilities"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
