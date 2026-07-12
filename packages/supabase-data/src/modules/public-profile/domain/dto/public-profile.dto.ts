import type {
  LinktreeData,
  LinktreeLink,
  MutationResult,
  Psychologist,
  PsychologistLocation,
  PsychologistProfile,
  PsychologistServiceWithReference,
  UpdateLinktreeProfileInput,
} from "@workspace/supabase-data/types/entities";

export interface TimelineItemDTO {
  id: string;
  title: string;
  subtitle: string;
  period?: string;
  startYear?: string;
  endYear?: string;
  type: "academic" | "professional";
}

export interface UpdatePublicProfileInputDTO {
  display_name?: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string | null;
  avatar_path?: string | null;
  background_url?: string | null;
  background_path?: string | null;
  city?: string;
  state?: string;
  languages?: string[];
  specialties?: string[];
  therapeutic_approaches?: string[];
  academic_timeline?: TimelineItemDTO[];
  professional_timeline?: TimelineItemDTO[];
  registered_specialties?: string[];
  gallery_photos?: string[];
  is_public?: boolean;
  show_in_marketplace?: boolean;
  profile_sections?: { id: string; active: boolean }[];
  video_section?: {
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
  } | null;
}

export type UpdatePublicSiteSettingsInputDTO = UpdateLinktreeProfileInput;

export interface PublicProfileLinkInputDTO {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface SyncPublicProfileLinksInputDTO {
  links: PublicProfileLinkInputDTO[];
}

export interface CheckPublicProfileSlugResultDTO {
  available: boolean;
}

export interface PublicProfileImageUploadDTO {
  url: string;
  path: string;
}

export type CurrentPublicProfileDTO = PsychologistProfile;
export type CurrentPublicLinksDTO = LinktreeLink[];
export type PublicPsychologistDTO = Psychologist;
export type PublicPsychologistLocationsDTO = PsychologistLocation[];
export type PublicPsychologistServicesDTO = PsychologistServiceWithReference[];
export type PublicLinktreeDTO = LinktreeData;
export type PublicProfileMutationResultDTO = MutationResult;
