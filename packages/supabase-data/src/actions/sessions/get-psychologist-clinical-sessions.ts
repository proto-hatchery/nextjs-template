"use server";

import { ok, err } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import type { SessionWithDetails } from "../../types/entities";

// Match database enum exactly
const sessionStatusSchema = z.enum([
  "scheduled",
  "open",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
]);

const getPsychologistClinicalSessionsRequestSchema = z
  .object({
    status: sessionStatusSchema.optional(),
    patientId: z.uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().min(0).optional(),
  })
  .strict();

export type GetPsychologistClinicalSessionsRequest = z.infer<
  typeof getPsychologistClinicalSessionsRequestSchema
>;
export type GetPsychologistClinicalSessionsResponse = SessionWithDetails[];
export type GetPsychologistClinicalSessionsPromise = Promise<
  SerializedResult<GetPsychologistClinicalSessionsResponse>
>;

const _getPsychologistClinicalSessionsAction = createAction<
  GetPsychologistClinicalSessionsRequest,
  GetPsychologistClinicalSessionsResponse
>({
  name: "sessions.getPsychologistClinicalSessions",
  inputSchema: getPsychologistClinicalSessionsRequestSchema,
  handler: async (input, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);

    // Build filters only with defined values to satisfy exactOptionalPropertyTypes
    const filters: Record<string, unknown> = {};
    if (input.status !== undefined) filters.status = input.status;
    if (input.patientId !== undefined) filters.patientId = input.patientId;
    if (input.startDate !== undefined) filters.startDate = input.startDate;
    if (input.endDate !== undefined) filters.endDate = input.endDate;
    if (input.limit !== undefined) filters.limit = input.limit;
    if (input.offset !== undefined) filters.offset = input.offset;

    const sessions = await repository.listPsychologistSessions(context.userId, filters);
    if (sessions.isErr()) {
      return err(sessions.error);
    }

    return ok(sessions.value);
  },
});

export async function getPsychologistClinicalSessionsAction(
  input: GetPsychologistClinicalSessionsRequest = {},
): GetPsychologistClinicalSessionsPromise {
  const result = await _getPsychologistClinicalSessionsAction(input);
  return serializeResult(result);
}
