import type { MetadataRoute } from "next"

/** Space professional workspace manifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluri Space",
    short_name: "Space",
    description: "Workspace Fluri Space para gestao da rotina clinica.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
  }
}
