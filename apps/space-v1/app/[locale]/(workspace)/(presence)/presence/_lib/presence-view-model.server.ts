import "server-only"

import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client"
import { requireUser } from "@workspace/supabase-auth/session/require-user"
import { getProfileByUserId } from "@workspace/supabase-data/actions/profiles/get-profile-by-user-id"
import {
  listPsychologistPreferencesAction,
} from "@workspace/supabase-data/actions/preferences/psychologist-preferences-list.codegen"
import {
  listPsychologistServicesAction,
} from "@workspace/supabase-data/actions/preferences/psychologist-services-list.codegen"
import type { ProfileDTO } from "@workspace/supabase-data/modules/profiles/domain/dto/profile.dto"
import type { PsychologistPreferencesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-preferences.dto.codegen"
import type { PsychologistServicesDTO } from "@workspace/supabase-data/modules/preferences/domain/dto/psychologist-services.dto.codegen"

import type {
  PresenceLinkItem,
  PresencePreferencesView,
  PresenceProfileView,
  PresenceSectionsView,
} from "@/app/[locale]/(workspace)/(presence)/presence/_lib/presence-types"

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function parsePreferencesBlob(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function readNestedValue(object: Record<string, unknown>, paths: string[][]): unknown {
  for (const path of paths) {
    let current: unknown = object

    for (const segment of path) {
      if (typeof current !== "object" || current === null || Array.isArray(current)) {
        current = null
        break
      }

      current = (current as Record<string, unknown>)[segment]
    }

    if (current !== null && current !== undefined) {
      return current
    }
  }

  return null
}

function readNestedString(object: Record<string, unknown>, paths: string[][]) {
  return asString(readNestedValue(object, paths))
}

function readNestedBoolean(object: Record<string, unknown>, paths: string[][]) {
  return asBoolean(readNestedValue(object, paths))
}

function readNestedArray(object: Record<string, unknown>, paths: string[][]) {
  const value = readNestedValue(object, paths)
  return Array.isArray(value) ? value : []
}

function ensureUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("mailto:") ? value : `https://${value}`
}

function buildProfileUrl(blob: Record<string, unknown>) {
  const explicitUrl = readNestedString(blob, [
    ["publicUrl"],
    ["publicProfile", "url"],
    ["website", "url"],
    ["personalWebsite", "url"],
  ])

  if (explicitUrl) {
    return ensureUrl(explicitUrl)
  }

  const slug = readNestedString(blob, [
    ["slug"],
    ["publicProfile", "slug"],
    ["website", "slug"],
    ["publication", "slug"],
    ["personalWebsite", "slug"],
  ])

  return slug ? `https://me.fluri.com/${slug}` : null
}

function buildHeadline(profile: ProfileDTO | null, blob: Record<string, unknown>) {
  return (
    readNestedString(blob, [
      ["headline"],
      ["profile", "headline"],
      ["publicProfile", "headline"],
      ["personalWebsite", "headline"],
    ]) ??
    (profile?.fullName ? `${profile.fullName} • Public profile` : "Public profile headline is still pending")
  )
}

function buildBio(blob: Record<string, unknown>) {
  return (
    readNestedString(blob, [
      ["bio"],
      ["profile", "bio"],
      ["publicProfile", "bio"],
      ["personalWebsite", "bio"],
      ["description"],
    ]) ??
    "Public-facing profile copy has not been finalized yet. Keep this surface focused on what visitors need to understand quickly."
  )
}

function buildServiceHighlights(services: PsychologistServicesDTO[]) {
  const publicServices = services.filter(
    (service) => asBoolean(service.isActive) !== false && asBoolean(service.isPublic) === true
  )

  if (publicServices.length > 0) {
    return publicServices
      .slice()
      .sort((left, right) => (asNumber(left.sortOrder) ?? 0) - (asNumber(right.sortOrder) ?? 0))
      .slice(0, 3)
      .map((service) => asString(service.name) ?? "Unnamed public service")
  }

  const activeServices = services.filter((service) => asBoolean(service.isActive) !== false)

  return activeServices
    .slice()
    .sort((left, right) => (asNumber(left.sortOrder) ?? 0) - (asNumber(right.sortOrder) ?? 0))
    .slice(0, 3)
    .map((service) => asString(service.name) ?? "Unnamed service")
}

function buildReadinessChecks(
  profile: ProfileDTO | null,
  blob: Record<string, unknown>,
  services: PsychologistServicesDTO[],
  profileUrl: string | null
) {
  const checks: string[] = []
  const publicServices = services.filter(
    (service) => asBoolean(service.isActive) !== false && asBoolean(service.isPublic) === true
  )
  const headline = buildHeadline(profile, blob)
  const hasExplicitBio = Boolean(
    readNestedString(blob, [
      ["bio"],
      ["profile", "bio"],
      ["publicProfile", "bio"],
      ["personalWebsite", "bio"],
      ["description"],
    ])
  )

  checks.push(
    profile?.fullName
      ? `Display name is ready for public visitors as ${profile.fullName}.`
      : "Display name is still missing from the shared profile record."
  )
  checks.push(
    headline.includes("pending")
      ? "Headline still needs to be finalized before publishing."
      : "Headline framing is already present in the shared profile data."
  )
  checks.push(
    hasExplicitBio
      ? "Bio copy is available for the public-facing profile."
      : "Bio copy still needs a final editorial pass."
  )
  checks.push(
    publicServices.length > 0
      ? `${publicServices.length} service entries are already marked public.`
      : "No services are currently marked public."
  )
  checks.push(
    profileUrl
      ? `Public profile URL is ready at ${profileUrl}.`
      : "Public profile URL is not configured yet."
  )

  return checks
}

function buildCompletenessLabel(checks: string[]) {
  const readyCount = checks.filter(
    (check) =>
      check.includes("is ready") ||
      check.includes("already present") ||
      check.includes("is available") ||
      check.includes("already marked public") ||
      check.includes("is ready at")
  ).length

  return readyCount >= 4 ? "Ready to review" : "Needs setup"
}

function buildPublicStatusLabel(blob: Record<string, unknown>, services: PsychologistServicesDTO[]) {
  const isPublic =
    readNestedBoolean(blob, [
      ["isPublic"],
      ["publicProfile", "isPublic"],
      ["publication", "isPublic"],
      ["personalWebsite", "isPublic"],
    ]) ?? false

  const publicServices = services.filter(
    (service) => asBoolean(service.isActive) !== false && asBoolean(service.isPublic) === true
  ).length

  if (isPublic && publicServices > 0) {
    return `Public visibility is on with ${publicServices} visible service${publicServices === 1 ? "" : "s"}.`
  }

  if (isPublic) {
    return "Public visibility is on, but no services are marked public yet."
  }

  return "Public visibility is still off in the current read model."
}

function buildProfileView(
  profile: ProfileDTO | null,
  preferences: PsychologistPreferencesDTO | null,
  services: PsychologistServicesDTO[]
): PresenceProfileView {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const profileUrl = buildProfileUrl(blob)
  const readinessChecks = buildReadinessChecks(profile, blob, services, profileUrl)

  return {
    headline: buildHeadline(profile, blob),
    bio: buildBio(blob),
    serviceHighlights: buildServiceHighlights(services),
    readinessChecks,
    profileUrl,
    publicStatusLabel: buildPublicStatusLabel(blob, services),
    completenessLabel: buildCompletenessLabel(readinessChecks),
  }
}

function buildFallbackLinks(profile: ProfileDTO | null, profileUrl: string | null): PresenceLinkItem[] {
  const links: PresenceLinkItem[] = []

  if (profileUrl) {
    links.push({
      label: "Public profile",
      href: profileUrl,
      status: "Published",
    })
  }

  if (profile?.email) {
    links.push({
      label: "Contact email",
      href: `mailto:${profile.email}`,
      status: "Support",
    })
  }

  return links
}

function buildLinksView(
  profile: ProfileDTO | null,
  preferences: PsychologistPreferencesDTO | null,
  services: PsychologistServicesDTO[]
) {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const profileUrl = buildProfileUrl(blob)
  const configuredLinks = readNestedArray(blob, [
    ["links"],
    ["publicProfile", "links"],
    ["personalWebsite", "links"],
    ["linktree", "links"],
  ])

  const mappedLinks = configuredLinks.flatMap((item, index) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return []
    }

    const record = item as Record<string, unknown>
    const href = asString(record.href) ?? asString(record.url)

    if (!href) {
      return []
    }

    const label = asString(record.label) ?? asString(record.title) ?? `Link ${index + 1}`
    const isPrimary = asBoolean(record.isPrimary) === true
    const isPublished = asBoolean(record.isPublished) !== false

    return [
      {
        label,
        href: ensureUrl(href),
        status: isPrimary ? "Primary" : isPublished ? "Published" : "Draft",
      },
    ]
  })

  const fallbackLinks = buildFallbackLinks(profile, profileUrl)
  const serviceLinks = services
    .filter((service) => asBoolean(service.isActive) !== false && asBoolean(service.isPublic) === true)
    .slice(0, 2)
    .map((service) => ({
      label: asString(service.name) ?? "Public service",
      href: profileUrl ?? "#",
      status: "Service",
    }))
    .filter((service) => service.href !== "#")

  const items = [...mappedLinks]

  for (const candidate of [...fallbackLinks, ...serviceLinks]) {
    if (!items.some((item) => item.href === candidate.href && item.label === candidate.label)) {
      items.push(candidate)
    }
  }

  const visibleLinksCount = items.length

  return {
    items,
    visibleLinksCountLabel: `${visibleLinksCount} visible public link${visibleLinksCount === 1 ? "" : "s"}`,
    guidance: [
      profileUrl
        ? "Public profile URL is available for visitor-facing traffic."
        : "Configure a public URL or slug before publishing broadly.",
      visibleLinksCount > 0
        ? "Link inventory is available from shared data and ready for later editing."
        : "No shared links are available yet, so later editing flows should start here.",
      "Keep booking or primary conversion paths above low-priority contact destinations.",
    ],
  }
}

function buildPreferencesView(
  preferences: PsychologistPreferencesDTO | null,
  services: PsychologistServicesDTO[]
): PresencePreferencesView {
  const blob = parsePreferencesBlob(preferences?.preferences)
  const publicServicesCount = services.filter(
    (service) => asBoolean(service.isActive) !== false && asBoolean(service.isPublic) === true
  ).length
  const publicVisibilityEnabled =
    readNestedBoolean(blob, [
      ["isPublic"],
      ["publicProfile", "isPublic"],
      ["publication", "isPublic"],
      ["personalWebsite", "isPublic"],
    ]) === true
  const marketplaceEnabled =
    readNestedBoolean(blob, [
      ["showInMarketplace"],
      ["publicProfile", "showInMarketplace"],
      ["publication", "showInMarketplace"],
    ]) === true
  const acceptingNewPatientsEnabled =
    readNestedBoolean(blob, [
      ["acceptingNewPatients"],
      ["publicProfile", "acceptingNewPatients"],
      ["publication", "acceptingNewPatients"],
    ]) === true

  const items = [
    {
      label: "Public profile visibility",
      description: "Controls whether the public-facing profile should be considered live.",
      enabled: publicVisibilityEnabled,
    },
    {
      label: "Show in marketplace",
      description: "Determines whether the public profile is discoverable in broader search surfaces.",
      enabled: marketplaceEnabled,
    },
    {
      label: "Accepting new patients",
      description: "Signals whether new visitors should interpret the public profile as open for intake.",
      enabled: acceptingNewPatientsEnabled,
    },
    {
      label: "Promote public services",
      description: "Highlights services that are already marked public in the shared services model.",
      enabled: publicServicesCount > 0,
    },
  ]

  return {
    items,
    rolloutNotes: [
      publicVisibilityEnabled
        ? "Public visibility is already enabled in the current shared preferences record."
        : "Public visibility remains disabled until a later publish-safe mutation phase.",
      marketplaceEnabled
        ? "Marketplace visibility is currently represented in the shared preferences record."
        : "Marketplace visibility is not active in the current read model.",
      publicServicesCount > 0
        ? `${publicServicesCount} public service entries are ready to support the next publishing phase.`
        : "Public services still need to be selected before stronger publishing flows land.",
    ],
  }
}

export async function getPresenceSectionsView(): Promise<PresenceSectionsView> {
  const claims = await requireUser()
  const supabase = await createServerAuthClient()

  const [profile, preferencesResult, servicesResult] = await Promise.all([
    getProfileByUserId(supabase, claims.sub),
    listPsychologistPreferencesAction({ limit: 1, offset: 0 }),
    listPsychologistServicesAction({ limit: 100, offset: 0 }),
  ])

  const preferences = preferencesResult.rows[0] ?? null
  const services = servicesResult.rows
    .slice()
    .sort((left, right) => (asNumber(left.sortOrder) ?? 0) - (asNumber(right.sortOrder) ?? 0))

  return {
    profile: buildProfileView(profile, preferences, services),
    links: buildLinksView(profile, preferences, services),
    preferences: buildPreferencesView(preferences, services),
  }
}
