import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { Fustat, Geist_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { connection } from "next/server"
import type { ReactNode } from "react"

import "@workspace/ui/globals.css"
import { AppProviders } from "@/app/_providers/app-providers.example"
import { routing } from "@/i18n/routing"
import { getSiteUrl } from "@/lib/site-url"
import { buildAlternateLanguages, buildCanonicalUrl } from "@workspace/seo"
import { cn } from "@workspace/ui/lib/utils"

import { WebVitals } from "./_components/web-vitals"

const fontSans = Fustat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-serif",
})

type Props = Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>

function ensureValidLocale(locale: string): (typeof routing.locales)[number] {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }
  return locale as (typeof routing.locales)[number]
}

function openGraphLocaleTag(locale: string): string {
  if (locale === "pt-BR") {
    return "pt_BR"
  }
  return "en_US"
}

// FORK: Align themeColor with manifest.ts and your brand palette.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // FORK: Set themeColor to match your brand. Must match manifest.ts theme_color.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params
  const locale = ensureValidLocale(rawLocale)

  const t = await getTranslations({ locale, namespace: "Metadata" })
  const siteUrl = getSiteUrl()
  const metadataBase = new URL(`${siteUrl}/`)

  const canonicalUrl = buildCanonicalUrl({
    siteUrl,
    locale,
    defaultLocale: routing.defaultLocale,
    path: "/",
  })

  const languageAlternates = buildAlternateLanguages({
    siteUrl,
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    path: "/",
  })

  return {
    metadataBase,
    title: {
      default: t("title"),
      template: `%s — ${t("title")}`,
    },
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      locale: openGraphLocaleTag(locale),
      url: canonicalUrl,
      siteName: t("title"),
      title: t("title"),
      description: t("description"),
      // `(marketing)/opengraph-image.tsx` supplies og:image for the marketing route tree (file convention wins over static paths).
      // FORK: For routes without `opengraph-image.tsx`, set `openGraph.images` / `twitter.images` in `generateMetadata`, or use tracked `/og-default.png` (1200×630, <200KB). See docs/guides/seo.md.
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  if (process.env.CSP_ENFORCE === "1") {
    await connection()
  }

  const { locale: rawLocale } = await params
  const locale = ensureValidLocale(rawLocale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn("antialiased", fontMono.variable, fontSans.variable)}>
        <WebVitals />
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
