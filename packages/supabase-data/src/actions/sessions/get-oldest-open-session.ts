"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import type { SessionWithDetails } from "../../types/entities";

const getOldestOpenSessionRequestSchema = z.undefined().optional();

export type GetOldestOpenSessionResponse = SessionWithDetails | null;

const _getOldestOpenSessionAction = createAction<void | undefined, GetOldestOpenSessionResponse>({
  name: "sessions.getOldestOpenSession",
  inputSchema: getOldestOpenSessionRequestSchema,
  handler: async (_input, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);
    const session = await repository.getOldestOpenSession(context.userId);
    if (session.isErr()) {
      return session;
    }

    return ok(session.value);
  },
});

export async function getOldestOpenSessionAction(): Promise<
  SerializedResult<GetOldestOpenSessionResponse>
> {
  const result = await _getOldestOpenSessionAction(undefined);
  return serializeResult(result);
}
