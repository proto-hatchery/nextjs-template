"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { uploadPublicProfileImageForUser } from "../../modules/public-profile/application/public-profile-commands";

export type UploadPublicProfileImageResponse = {
  url: string;
  path: string;
};

const uploadPublicProfileImageRequestSchema = z
  .object({
    croppedImage: z.string().min(1),
    previousUrl: z.string().optional(),
    previousPath: z.string().optional(),
  })
  .strict();

export type UploadPublicProfileImageRequest = z.infer<typeof uploadPublicProfileImageRequestSchema>;

const _uploadPublicProfileAvatar = createAction<
  UploadPublicProfileImageRequest,
  UploadPublicProfileImageResponse
>({
  name: "publicProfile.uploadAvatar",
  inputSchema: uploadPublicProfileImageRequestSchema,
  handler: async (input, context) => {
    const result = await uploadPublicProfileImageForUser(
      context.supabase,
      context.userId,
      "avatar",
      input.croppedImage,
      input.previousUrl,
      input.previousPath,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function uploadPublicProfileAvatarAction(
  input: UploadPublicProfileImageRequest,
): Promise<SerializedResult<UploadPublicProfileImageResponse>> {
  return serializeResult(await _uploadPublicProfileAvatar(input));
}

const _uploadPublicProfileBackground = createAction<
  UploadPublicProfileImageRequest,
  UploadPublicProfileImageResponse
>({
  name: "publicProfile.uploadBackground",
  inputSchema: uploadPublicProfileImageRequestSchema,
  handler: async (input, context) => {
    const result = await uploadPublicProfileImageForUser(
      context.supabase,
      context.userId,
      "background",
      input.croppedImage,
      input.previousUrl,
      input.previousPath,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function uploadPublicProfileBackgroundAction(
  input: UploadPublicProfileImageRequest,
): Promise<SerializedResult<UploadPublicProfileImageResponse>> {
  return serializeResult(await _uploadPublicProfileBackground(input));
}
