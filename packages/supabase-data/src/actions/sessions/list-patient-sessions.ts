"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";
import { verifyPatientOwnership } from "../../utils/authorization";
import type { SessionWithDetails } from "../../types/entities";

const listPatientSessionsRequestSchema = z
  .object({
    patientId: z.uuid(),
    limit: z.number().int().positive().optional(),
    timezone: z.string().optional(),
  })
  .strict();

export type ListPatientSessionsRequest = z.infer<typeof listPatientSessionsRequestSchema>;
export type ListPatientSessionsResponse = { sessions: SessionWithDetails[] };
export type ListPatientSessionsPromise = Promise<SerializedResult<ListPatientSessionsResponse>>;

const _listPatientSessionsAction = createAction<
  ListPatientSessionsRequest,
  ListPatientSessionsResponse
>({
  name: "sessions.listPatientSessions",
  inputSchema: listPatientSessionsRequestSchema,
  handler: async ({ patientId, limit, timezone }, context) => {
    // Verify patient ownership
    const isOwner = await verifyPatientOwnership(context.supabase, context.userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const repository = new SessionSupabaseRepository(context.supabase);
    const result = await repository.listPatientSessions(patientId, limit, timezone);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ sessions: result.value });
  },
});

export async function listPatientSessionsAction(
  input: ListPatientSessionsRequest,
): Promise<SerializedResult<ListPatientSessionsResponse>> {
  const result = await _listPatientSessionsAction(input);
  return serializeResult(result);
}
