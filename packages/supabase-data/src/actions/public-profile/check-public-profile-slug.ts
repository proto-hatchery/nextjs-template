"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { checkPublicProfileSlugAvailabilityForUser } from "../../modules/public-profile/application/public-profile-commands";

export type CheckPublicProfileSlugRequest = {
  slug: string;
};

export type CheckPublicProfileSlugResponse = {
  available: boolean;
};

const checkPublicProfileSlugRequestSchema = z
  .object({
    slug: z.string(),
  })
  .strict();

const _checkPublicProfileSlug = createAction<
  CheckPublicProfileSlugRequest,
  CheckPublicProfileSlugResponse
>({
  name: "publicProfile.checkSlug",
  inputSchema: checkPublicProfileSlugRequestSchema,
  handler: async (input, context) => {
    const result = await checkPublicProfileSlugAvailabilityForUser(
      context.supabase,
      context.userId,
      input.slug,
    );
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function checkPublicProfileSlugAction(
  input: CheckPublicProfileSlugRequest,
): Promise<SerializedResult<CheckPublicProfileSlugResponse>> {
  return serializeResult(await _checkPublicProfileSlug(input));
}
