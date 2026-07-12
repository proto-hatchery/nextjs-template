"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  profileEducationSchema,
  profileExperienceSchema,
  profileLinksSchema,
  profilePublishSchema,
  profileSlugSchema,
  profileSpecialtiesSchema,
  profileVisualSchema,
  type ProfileEducationData,
  type ProfileExperienceData,
  type ProfileLinksData,
  type ProfilePublishData,
  type ProfileSlugData,
  type ProfileSpecialtiesData,
  type ProfileVisualData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { completeOnboardingPhaseForUser } from "../../../modules/onboarding/application/onboarding-commands";
import {
  getCurrentPublicLinksForUser,
  getCurrentPublicProfileForUser,
} from "../../../modules/public-profile/application/public-profile-queries";
import {
  syncPublicProfileLinksForUser,
  updatePublicSiteSettingsForUser,
} from "../../../modules/public-profile/application/public-profile-commands";
import { getPsychologist } from "../../../modules/psychologists/application/psychologist-queries";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const getProfileOnboardingDataRequestSchema = z.object({}).strict();

export type GetProfileOnboardingDataRequest = z.infer<typeof getProfileOnboardingDataRequestSchema>;
export type GetProfileOnboardingDataResponse = {
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarPath?: string;
  phone?: string;
  specialties: string[];
  therapeuticApproaches: string[];
  academicTimeline: Array<Record<string, unknown>>;
  professionalTimeline: Array<Record<string, unknown>>;
  showInMarketplace: boolean;
  acceptingNewPatients: boolean;
  links: Array<{
    id: string;
    title: string;
    url: string;
    active: boolean;
  }>;
};

type StepSaveResponse<TStep extends string> = {
  success: true;
  completedStep: TStep;
};

const _getProfileOnboardingData = createAction<
  GetProfileOnboardingDataRequest,
  GetProfileOnboardingDataResponse
>({
  name: "onboarding.getProfileOnboardingData",
  inputSchema: getProfileOnboardingDataRequestSchema,
  handler: async (_input, context) => {
    const [profile, links, psychologist] = await Promise.all([
      getCurrentPublicProfileForUser(context.supabase, context.userId),
      getCurrentPublicLinksForUser(context.supabase, context.userId),
      getPsychologist(context.supabase, context.userId),
    ]);

    if (profile.isErr()) {
      return err(profile.error);
    }

    if (links.isErr()) {
      return err(links.error);
    }

    const currentProfile = profile.value;
    return ok({
      slug: currentProfile?.slug ?? "",
      displayName: currentProfile?.display_name ?? psychologist?.display_name ?? "",
      bio: currentProfile?.bio ?? "",
      avatarUrl: currentProfile?.avatar_url ?? "",
      ...(currentProfile?.avatar_path ? { avatarPath: currentProfile.avatar_path } : {}),
      ...(psychologist?.phone ? { phone: psychologist.phone } : {}),
      specialties: currentProfile?.specialties ?? [],
      therapeuticApproaches: currentProfile?.therapeutic_approaches ?? [],
      academicTimeline:
        (currentProfile?.academic_timeline as Array<Record<string, unknown>> | null) ?? [],
      professionalTimeline:
        (currentProfile?.professional_timeline as Array<Record<string, unknown>> | null) ?? [],
      showInMarketplace: currentProfile?.show_in_marketplace ?? false,
      acceptingNewPatients: currentProfile?.accepting_new_patients ?? false,
      links: links.value.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        active: link.is_active,
      })),
    });
  },
});

export async function getProfileOnboardingDataAction(
  input: GetProfileOnboardingDataRequest,
): Promise<SerializedResult<GetProfileOnboardingDataResponse>> {
  return serializeResult(await _getProfileOnboardingData(input));
}

const _saveProfileSlug = createAction<ProfileSlugData, StepSaveResponse<"slug">>({
  name: "onboarding.saveProfileSlug",
  inputSchema: profileSlugSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      usernameSlug: input.slug,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "slug",
      nextStepId: "links",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "slug" });
  },
});

export async function saveProfileSlugAction(
  input: ProfileSlugData,
): Promise<SerializedResult<StepSaveResponse<"slug">>> {
  return serializeResult(await _saveProfileSlug(input));
}

const _saveProfileLinks = createAction<ProfileLinksData, StepSaveResponse<"links">>({
  name: "onboarding.saveProfileLinks",
  inputSchema: profileLinksSchema,
  handler: async (input, context) => {
    const result = await syncPublicProfileLinksForUser(context.supabase, context.userId, {
      links: input.links.map((link: ProfileLinksData["links"][number], index: number) => ({
        id: link.id ?? globalThis.crypto.randomUUID(),
        title: link.title,
        url: link.url,
        isActive: link.active,
        sortOrder: index,
      })),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "links",
      nextStepId: "visual",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "links" });
  },
});

export async function saveProfileLinksAction(
  input: ProfileLinksData,
): Promise<SerializedResult<StepSaveResponse<"links">>> {
  return serializeResult(await _saveProfileLinks(input));
}

const _saveProfileVisual = createAction<ProfileVisualData, StepSaveResponse<"visual">>({
  name: "onboarding.saveProfileVisual",
  inputSchema: profileVisualSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      displayName: input.displayName,
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "visual",
      nextStepId: "specialties",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "visual" });
  },
});

export async function saveProfileVisualAction(
  input: ProfileVisualData,
): Promise<SerializedResult<StepSaveResponse<"visual">>> {
  return serializeResult(await _saveProfileVisual(input));
}

const _saveProfileSpecialties = createAction<
  ProfileSpecialtiesData,
  StepSaveResponse<"specialties">
>({
  name: "onboarding.saveProfileSpecialties",
  inputSchema: profileSpecialtiesSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      specialties: input.specialties,
      therapeuticApproaches: input.therapeuticApproaches,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "specialties",
      nextStepId: "education",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "specialties" });
  },
});

export async function saveProfileSpecialtiesAction(
  input: ProfileSpecialtiesData,
): Promise<SerializedResult<StepSaveResponse<"specialties">>> {
  return serializeResult(await _saveProfileSpecialties(input));
}

const _saveProfileEducation = createAction<ProfileEducationData, StepSaveResponse<"education">>({
  name: "onboarding.saveProfileEducation",
  inputSchema: profileEducationSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      academicTimeline: input.academicTimeline as never,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "education",
      nextStepId: "experience",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "education" });
  },
});

export async function saveProfileEducationAction(
  input: ProfileEducationData,
): Promise<SerializedResult<StepSaveResponse<"education">>> {
  return serializeResult(await _saveProfileEducation(input));
}

const _saveProfileExperience = createAction<ProfileExperienceData, StepSaveResponse<"experience">>({
  name: "onboarding.saveProfileExperience",
  inputSchema: profileExperienceSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      professionalTimeline: input.professionalTimeline as never,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    const { error } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "experience",
      nextStepId: "publish",
      draftData: input,
    });
    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to advance onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "experience" });
  },
});

export async function saveProfileExperienceAction(
  input: ProfileExperienceData,
): Promise<SerializedResult<StepSaveResponse<"experience">>> {
  return serializeResult(await _saveProfileExperience(input));
}

const _publishProfile = createAction<ProfilePublishData, StepSaveResponse<"publish">>({
  name: "onboarding.publishProfile",
  inputSchema: profilePublishSchema,
  handler: async (input, context) => {
    const updateResult = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      isPublic: true,
      showInMarketplace: input.showInMarketplace,
      acceptingNewPatients: input.acceptingNewPatients,
    });

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    const phaseResult = await completeOnboardingPhaseForUser(context.supabase, context.userId, 4);
    if (phaseResult.isErr()) {
      return err(phaseResult.error);
    }

    const { error } = await context.supabase.rpc(
      "update_onboarding_step" as never,
      {
        p_psychologist_id: context.userId,
        p_step_id: "publish",
        p_is_complete: true,
        p_draft_data: input,
      } as never,
    );

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to finalize onboarding step", error),
      );
    }

    return ok({ success: true, completedStep: "publish" });
  },
});

export async function publishProfileAction(
  input: ProfilePublishData,
): Promise<SerializedResult<StepSaveResponse<"publish">>> {
  return serializeResult(await _publishProfile(input));
}
