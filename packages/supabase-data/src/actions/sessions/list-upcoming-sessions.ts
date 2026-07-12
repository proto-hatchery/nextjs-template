"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import type { SessionWithDetails } from "../../types/entities";

const listUpcomingSessionsRequestSchema = z
  .object({
    limit: z.number().int().positive().optional(),
    timezone: z.string().optional(),
  })
  .strict();

export type ListUpcomingSessionsRequest = z.infer<typeof listUpcomingSessionsRequestSchema>;
export type ListUpcomingSessionsResponse = { sessions: SessionWithDetails[] };
export type ListUpcomingSessionsPromise = Promise<SerializedResult<ListUpcomingSessionsResponse>>;

const _listUpcomingSessionsAction = createAction<
  ListUpcomingSessionsRequest,
  ListUpcomingSessionsResponse
>({
  name: "sessions.listUpcomingSessions",
  inputSchema: listUpcomingSessionsRequestSchema,
  handler: async ({ limit, timezone }, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);
    const result = await repository.listUpcomingSessions(context.userId, limit, timezone);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ sessions: result.value });
  },
});

export async function listUpcomingSessionsAction(
  input: ListUpcomingSessionsRequest = {},
): ListUpcomingSessionsPromise {
  const result = await _listUpcomingSessionsAction(input);
  return serializeResult(result);
}
