"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { MutationResult, UpdateLinktreeProfileInput } from "../../types/entities";
import { updatePublicSiteSettingsForUser } from "../../modules/public-profile/application/public-profile-commands";

export type UpdatePublicSiteSettingsRequest = UpdateLinktreeProfileInput;
export type UpdatePublicSiteSettingsResponse = MutationResult;

const updatePublicSiteSettingsRequestSchema = z.custom<UpdatePublicSiteSettingsRequest>(
  (value) => typeof value === "object" && value !== null,
);

const _updatePublicSiteSettings = createAction<
  UpdatePublicSiteSettingsRequest,
  UpdatePublicSiteSettingsResponse
>({
  name: "publicProfile.updateSiteSettings",
  inputSchema: updatePublicSiteSettingsRequestSchema,
  handler: async (input, context) => {
    const result = await updatePublicSiteSettingsForUser(context.supabase, context.userId, input);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function updatePublicSiteSettingsAction(
  input: UpdatePublicSiteSettingsRequest,
): Promise<SerializedResult<UpdatePublicSiteSettingsResponse>> {
  return serializeResult(await _updatePublicSiteSettings(input));
}
