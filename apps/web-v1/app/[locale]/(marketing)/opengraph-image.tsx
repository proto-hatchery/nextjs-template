import { getTranslations } from "next-intl/server"
import { ImageResponse } from "next/og"

// FORK: Customize dimensions, fonts, and layout for your brand.
export const runtime = "edge"
export const alt = "Marketing page OG image"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata" })

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "80px",
      }}
    >
      {/* FORK: Replace with your brand logo SVG or <img> */}
      <div style={{ fontSize: 72, fontWeight: 700, textAlign: "center" }}>{t("title")}</div>
      <div
        style={{
          fontSize: 32,
          color: "#94a3b8",
          textAlign: "center",
          marginTop: 24,
          maxWidth: 800,
        }}
      >
        {t("description")}
      </div>
    </div>,
    { ...size }
  )
}
