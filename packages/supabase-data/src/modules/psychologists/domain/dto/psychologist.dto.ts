import type {
  Psychologist,
  PsychologistLocation,
  PsychologistOnboardingState,
  PsychologistServiceWithReference,
  UpdatePsychologistCredentialsInput,
  UpdatePsychologistProfileInput,
  UpsertLocationInput,
  UpsertServiceInput,
} from "@workspace/supabase-data/types/entities";

export type PsychologistDTO = Psychologist;
export type PsychologistLocationDTO = PsychologistLocation;
export type PsychologistOnboardingStateDTO = PsychologistOnboardingState;
export type PsychologistServiceWithReferenceDTO = PsychologistServiceWithReference;

export type UpdatePsychologistProfileDTO = UpdatePsychologistProfileInput;
export type UpdatePsychologistCredentialsDTO = UpdatePsychologistCredentialsInput;
export type UpsertPsychologistServiceDTO = UpsertServiceInput;
export type UpsertPsychologistLocationDTO = UpsertLocationInput;
