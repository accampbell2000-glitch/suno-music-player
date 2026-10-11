import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CalcForged",
    short_name: "CalcForged",
    description: "Practical calculators. Straight answers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#c95d2d",
    icons: [
      { src: "/icons/calcforged-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/calcforged-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/calcforged-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
