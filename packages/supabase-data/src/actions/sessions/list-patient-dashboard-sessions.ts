"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import type { SessionWithDetails } from "../../types/entities";

const listPatientDashboardSessionsRequestSchema = z
  .object({
    limit: z.number().int().positive().optional(),
    timezone: z.string().optional(),
  })
  .strict();

export type ListPatientDashboardSessionsRequest = z.infer<
  typeof listPatientDashboardSessionsRequestSchema
>;
export type ListPatientDashboardSessionsResponse = { sessions: SessionWithDetails[] };
export type ListPatientDashboardSessionsPromise = Promise<
  SerializedResult<ListPatientDashboardSessionsResponse>
>;

const _listPatientDashboardSessionsAction = createAction<
  ListPatientDashboardSessionsRequest,
  ListPatientDashboardSessionsResponse
>({
  name: "sessions.listPatientDashboardSessions",
  inputSchema: listPatientDashboardSessionsRequestSchema,
  handler: async ({ limit, timezone }, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);
    // Pass context.userId for explicit scoping at the boundary
    const result = await repository.listPatientDashboardSessions(limit, timezone, context.userId);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ sessions: result.value });
  },
});

export async function listPatientDashboardSessionsAction(
  input: ListPatientDashboardSessionsRequest = {},
): ListPatientDashboardSessionsPromise {
  const result = await _listPatientDashboardSessionsAction(input);
  return serializeResult(result);
}
