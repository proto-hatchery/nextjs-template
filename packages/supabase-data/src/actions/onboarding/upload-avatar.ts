"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import type { SerializedResult } from "../../lib/boundary/serialize-result";
import { serializeResult } from "../../lib/boundary/serialize-result";
import { updatePublicSiteSettingsForUser } from "../../modules/public-profile/application/public-profile-commands";
import {
  removeOnboardingAvatar,
  uploadOnboardingAvatar,
} from "../../modules/onboarding/infrastructure/storage/onboarding-avatar.storage";

export type UploadOnboardingAvatarRequest = z.infer<typeof uploadOnboardingAvatarRequestSchema>;

export type UploadOnboardingAvatarResponse = {
  url: string;
  path: string;
};

const uploadOnboardingAvatarRequestSchema = z
  .object({
    croppedImage: z.string().min(1),
    previousUrl: z.string().optional(),
    previousPath: z.string().optional(),
  })
  .strict();

const _uploadOnboardingAvatar = createAction<
  UploadOnboardingAvatarRequest,
  UploadOnboardingAvatarResponse
>({
  name: "onboarding.uploadAvatar",
  inputSchema: uploadOnboardingAvatarRequestSchema,
  handler: async (input, context) => {
    const result = await uploadOnboardingAvatar(
      context.supabase,
      context.userId,
      input.croppedImage,
      input.previousUrl,
      input.previousPath,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    const updateResult = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      avatarUrl: result.value.url,
      avatarPath: result.value.path,
    });
    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    return ok(result.value);
  },
});

export async function uploadOnboardingAvatarAction(
  input: UploadOnboardingAvatarRequest,
): Promise<SerializedResult<UploadOnboardingAvatarResponse>> {
  const result = await _uploadOnboardingAvatar(input);

  return serializeResult(result);
}

export type RemoveOnboardingAvatarRequest = z.infer<typeof removeOnboardingAvatarRequestSchema>;

export type RemoveOnboardingAvatarResponse = {
  success: true;
};

const removeOnboardingAvatarRequestSchema = z
  .object({
    previousUrl: z.string().optional(),
    previousPath: z.string().optional(),
  })
  .strict();

const _removeOnboardingAvatar = createAction<
  RemoveOnboardingAvatarRequest,
  RemoveOnboardingAvatarResponse
>({
  name: "onboarding.removeAvatar",
  inputSchema: removeOnboardingAvatarRequestSchema,
  handler: async (input, context) => {
    const result = await removeOnboardingAvatar(
      context.supabase,
      context.userId,
      input.previousUrl,
      input.previousPath,
    );

    if (result.isErr()) {
      return err(result.error);
    }

    const updateResult = await updatePublicSiteSettingsForUser(context.supabase, context.userId, {
      avatarUrl: null,
      avatarPath: null,
    });
    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    return ok(result.value);
  },
});

export async function removeOnboardingAvatarAction(
  input: RemoveOnboardingAvatarRequest,
): Promise<SerializedResult<RemoveOnboardingAvatarResponse>> {
  const result = await _removeOnboardingAvatar(input);

  return serializeResult(result);
}
