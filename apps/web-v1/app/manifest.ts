import type { MetadataRoute } from "next"

/** Web public surface manifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluri",
    short_name: "Fluri",
    description: "Plataforma Fluri para psicologas e pacientes.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
  }
}
