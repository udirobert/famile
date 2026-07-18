import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "famile - a suite of health products",
    short_name: "famile",
    description:
      "AI-native and AI-enabled health products built for continuous, human-scale care.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0716",
    theme_color: "#0a0716",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
