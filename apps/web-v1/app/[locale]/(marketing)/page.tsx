/* oxlint-disable react/no-danger -- JSON-LD must be injected as raw script content in this page. */
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getSiteUrl } from "@/lib/site-url"
import { buildCanonicalUrl, buildJsonLd } from "@workspace/seo"
import { Button } from "@workspace/ui/components/button"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata" })
  const siteUrl = getSiteUrl()

  return {
    title: t("title"),
    alternates: {
      canonical: buildCanonicalUrl({
        siteUrl,
        locale,
        defaultLocale: routing.defaultLocale,
        path: "/",
      }),
    },
    // FORK: Add page-specific description here when your home page has unique copy.
  }
}

export default async function MarketingHomePage() {
  const t = await getTranslations("Marketing")
  const siteOrigin = getSiteUrl()
  const locale = await getLocale()
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("jsonLdOrganizationName"),
    url: buildCanonicalUrl({
      siteUrl: siteOrigin,
      locale,
      defaultLocale: routing.defaultLocale,
      path: "/",
    }),
  }

  return (
    <>
      {/* JSON-LD must be injected as raw script content for crawlers to parse it correctly. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildJsonLd(organizationJsonLd),
        }}
      />
      <div className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col justify-center px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground text-sm font-medium">{t("templateLabel")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {t("hero.heading")}
            </h1>
            <p className="text-muted-foreground mt-4 text-lg text-pretty">{t("hero.subheading")}</p>
            <p className="text-muted-foreground mt-4 text-sm text-pretty">
              {t("bodyLine1")}{" "}
              <code className="bg-muted rounded px-1.5 py-0.5 text-sm">{t("bodyAuthSegment")}</code>
              {t("bodySuffix")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link href="/sign-in">{t("hero.cta")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
