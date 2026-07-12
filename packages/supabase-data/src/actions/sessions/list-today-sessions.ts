"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import type { SessionWithDetails } from "../../types/entities";

const listTodaySessionsRequestSchema = z
  .object({
    timezone: z.string().optional(),
  })
  .strict();

export type ListTodaySessionsRequest = z.infer<typeof listTodaySessionsRequestSchema>;
export type ListTodaySessionsResponse = { sessions: SessionWithDetails[] };
export type ListTodaySessionsPromise = Promise<SerializedResult<ListTodaySessionsResponse>>;

const _listTodaySessionsAction = createAction<ListTodaySessionsRequest, ListTodaySessionsResponse>({
  name: "sessions.listTodaySessions",
  inputSchema: listTodaySessionsRequestSchema,
  handler: async ({ timezone }, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);
    const result = await repository.listTodaySessions(context.userId, timezone);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ sessions: result.value });
  },
});

export async function listTodaySessionsAction(
  input: ListTodaySessionsRequest = {},
): ListTodaySessionsPromise {
  const result = await _listTodaySessionsAction(input);
  return serializeResult(result);
}
