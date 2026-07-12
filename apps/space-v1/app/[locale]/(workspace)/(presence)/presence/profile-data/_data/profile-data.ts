export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

export interface ProfileData {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string;
  backgroundUrl: string;
  backgroundPath: string;
  city: string;
  state: string;
  languages: string[];
  keywords: string[];
  therapeuticApproaches: string[];
  academicTimeline: TimelineItem[];
  professionalTimeline: TimelineItem[];
  registeredSpecialties: string[];
  galleryPhotos: string[];
  profileSections: {
    id:
      | "basic"
      | "specialties"
      | "approaches"
      | "languages"
      | "professional"
      | "academic"
      | "registered"
      | "gallery"
      | "video";
    active: boolean;
  }[];
  videoSection?: {
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
  };
  isPublic: boolean;
  showInMarketplace: boolean;
}

interface TimelineItemRaw {
  id: string;
  title: string;
  subtitle?: string;
  period?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  institution?: string;
  year?: string;
  description?: string;
  type?: string;
}

export function parseTimeline(value: unknown, kind: "academic" | "professional"): TimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item: unknown): item is TimelineItemRaw =>
        typeof item === "object" && item !== null && "id" in item && "title" in item,
    )
    .map((item) => {
      // Handle both old format (period) and new format (startDate/endDate/isCurrent)
      let startDate = item.startDate ?? "";
      let endDate = item.endDate ?? null;
      let isCurrent = item.isCurrent ?? false;

      // If period exists but startDate doesn't, try to parse from period
      if (item.period && !startDate) {
        const periodParts = item.period.split(" - ");
        startDate = periodParts[0] ?? "";
        if (periodParts[1] === "Atual" || periodParts[1] === "Present") {
          endDate = null;
          isCurrent = true;
        } else {
          endDate = periodParts[1] ?? null;
          isCurrent = false;
        }
      }

      return {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle ?? "",
        startDate,
        endDate,
        isCurrent,
        type: kind,
      };
    });
}

export function normalizeSocialLinks(value: unknown): SocialLinks {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, string | undefined | null>;
  return {
    ...(raw.instagram ? { instagram: raw.instagram } : {}),
    ...(raw.tiktok ? { tiktok: raw.tiktok } : {}),
    ...(raw.youtube ? { youtube: raw.youtube } : {}),
    ...(raw.twitter ? { twitter: raw.twitter } : {}),
    ...(raw.spotify ? { spotify: raw.spotify } : {}),
    ...(raw.linkedin ? { linkedin: raw.linkedin } : {}),
  };
}

export function buildProfileData({
  profile,
  psychologist,
}: {
  profile: unknown;
  psychologist: unknown;
}): ProfileData {
  const profileRecord = isRecord(profile) ? profile : {};
  const psychologistRecord = isRecord(psychologist) ? psychologist : {};

  const displayNameFromProfile = asString(profileRecord.display_name);
  const displayNameFromPsychologist = asString(psychologistRecord.display_name);
  const fullNameFromPsychologist = asString(psychologistRecord.full_name);

  const languages = asStringArray(profileRecord.languages);
  const specialties = asStringArray(profileRecord.specialties);
  const therapeuticApproaches = asStringArray(profileRecord.therapeutic_approaches);
  const registeredSpecialties = asStringArray(profileRecord.registered_specialties);
  const galleryPhotos = asStringArray(profileRecord.gallery_photos);

  const academicTimeline = parseTimeline(profileRecord.academic_timeline, "academic");
  const professionalTimeline = parseTimeline(profileRecord.professional_timeline, "professional");
  const videoSection: NonNullable<ProfileData["videoSection"]> = profileRecord.video_section
    ? (profileRecord.video_section as NonNullable<ProfileData["videoSection"]>)
    : { url: "" };

  // Auto-generate profile sections based on available data if not present
  let profileSections = Array.isArray(profileRecord.profile_sections)
    ? (profileRecord.profile_sections as ProfileData["profileSections"])
    : [];

  if (profileSections.length === 0) {
    profileSections = [
      { id: "basic", active: true },
      { id: "specialties", active: specialties.length > 0 },
      { id: "approaches", active: therapeuticApproaches.length > 0 },
      { id: "languages", active: languages.length > 0 },
      { id: "professional", active: professionalTimeline.length > 0 },
      { id: "academic", active: academicTimeline.length > 0 },
      { id: "registered", active: registeredSpecialties.length > 0 },
      { id: "gallery", active: galleryPhotos.length > 0 },
      { id: "video", active: !!profileRecord.video_section },
    ];
  }

  return {
    displayName:
      displayNameFromProfile ?? displayNameFromPsychologist ?? fullNameFromPsychologist ?? "",
    tagline: asString(profileRecord.tagline) ?? "",
    bio: asString(profileRecord.bio) ?? "",
    avatarUrl: asString(profileRecord.avatar_url) ?? "",
    avatarPath: asString(profileRecord.avatar_path) ?? "",
    backgroundUrl: asString(profileRecord.background_url) ?? "",
    backgroundPath: asString(profileRecord.background_path) ?? "",
    city: asString(profileRecord.city) ?? "",
    state: asString(profileRecord.state) ?? "",
    languages: languages.length > 0 ? languages : ["Português"],
    keywords: specialties,
    therapeuticApproaches,
    academicTimeline,
    professionalTimeline,
    registeredSpecialties,
    galleryPhotos,
    profileSections,
    videoSection,
    isPublic: asBoolean(profileRecord.is_public, true),
    showInMarketplace: asBoolean(profileRecord.show_in_marketplace, false),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asBoolean(value: unknown, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

export function buildUpdateData(input: ProfileData) {
  return {
    display_name: input.displayName,
    tagline: input.tagline,
    bio: input.bio,
    avatar_url: input.avatarUrl,
    avatar_path: input.avatarPath,
    background_url: input.backgroundUrl,
    background_path: input.backgroundPath,
    city: input.city,
    state: input.state,
    languages: input.languages,
    specialties: input.keywords,
    therapeutic_approaches: input.therapeuticApproaches,
    academic_timeline: input.academicTimeline,
    professional_timeline: input.professionalTimeline,
    registered_specialties: input.registeredSpecialties,
    gallery_photos: input.galleryPhotos,
    is_public: input.isPublic,
    show_in_marketplace: input.showInMarketplace,
    profile_sections: input.profileSections,
    video_section: input.videoSection?.url ? input.videoSection : null,
  };
}
