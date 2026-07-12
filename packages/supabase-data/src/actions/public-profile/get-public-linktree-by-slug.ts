"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { getPublicLinktreeBySlug } from "../../modules/public-profile/application/public-profile-queries";
import type { LinktreeData } from "../../types/entities";

export type GetPublicLinktreeBySlugRequest = {
  slug: string;
};

export type GetPublicLinktreeBySlugResponse = {
  linktreeData: LinktreeData | null;
};

const getPublicLinktreeBySlugRequestSchema = z
  .object({
    slug: z.string().min(1),
  })
  .strict();

const _getPublicLinktreeBySlug = createAction<
  GetPublicLinktreeBySlugRequest,
  GetPublicLinktreeBySlugResponse
>({
  name: "publicProfile.getLinktreeBySlug",
  inputSchema: getPublicLinktreeBySlugRequestSchema,
  requireAuth: false,
  handler: async (input, context) => {
    const result = await getPublicLinktreeBySlug(context.supabase, input.slug);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ linktreeData: result.value });
  },
});

export async function getPublicLinktreeBySlugAction(
  input: GetPublicLinktreeBySlugRequest,
): Promise<SerializedResult<GetPublicLinktreeBySlugResponse>> {
  return serializeResult(await _getPublicLinktreeBySlug(input));
}
