"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { MutationResult } from "../../types/entities";
import { updatePublicProfileForUser } from "../../modules/public-profile/application/public-profile-commands";
import type { UpdatePublicProfileInputDTO } from "../../modules/public-profile/domain/dto/public-profile.dto";

export type UpdatePublicProfileRequest = UpdatePublicProfileInputDTO;
export type UpdatePublicProfileResponse = MutationResult;

const updatePublicProfileRequestSchema = z.custom<UpdatePublicProfileRequest>(
  (value) => typeof value === "object" && value !== null,
);

const _updatePublicProfile = createAction<UpdatePublicProfileRequest, UpdatePublicProfileResponse>({
  name: "publicProfile.updateProfile",
  inputSchema: updatePublicProfileRequestSchema,
  handler: async (input, context) => {
    const result = await updatePublicProfileForUser(context.supabase, context.userId, input);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function updatePublicProfileAction(
  input: UpdatePublicProfileRequest,
): Promise<SerializedResult<UpdatePublicProfileResponse>> {
  return serializeResult(await _updatePublicProfile(input));
}
