import type { MetadataRoute } from "next"

/** Replace name/theme at fork — see apps/example/docs/seo.md */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Example App",
    short_name: "Example",
    description: "Replace at fork — PWA manifest stub for Add to Home Screen and share targets.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
  }
}
