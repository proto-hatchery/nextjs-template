"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { MutationResult, UpsertLinktreeLinksInput } from "../../types/entities";
import { syncPublicProfileLinksForUser } from "../../modules/public-profile/application/public-profile-commands";

export type SyncPublicProfileLinksRequest = UpsertLinktreeLinksInput;
export type SyncPublicProfileLinksResponse = MutationResult;

const syncPublicProfileLinksRequestSchema = z.custom<SyncPublicProfileLinksRequest>(
  (value) => typeof value === "object" && value !== null,
);

const _syncPublicProfileLinks = createAction<
  SyncPublicProfileLinksRequest,
  SyncPublicProfileLinksResponse
>({
  name: "publicProfile.syncLinks",
  inputSchema: syncPublicProfileLinksRequestSchema,
  handler: async (input, context) => {
    const result = await syncPublicProfileLinksForUser(context.supabase, context.userId, input);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function syncPublicProfileLinksAction(
  input: SyncPublicProfileLinksRequest,
): Promise<SerializedResult<SyncPublicProfileLinksResponse>> {
  return serializeResult(await _syncPublicProfileLinks(input));
}
