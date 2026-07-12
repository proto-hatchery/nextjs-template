"use server";

import { z } from "zod";
import { err, ok } from "neverthrow";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { PatientSupabaseRepository } from "../../modules/patients/infrastructure/repositories/patient-supabase.repository";
import type { PatientsCollectionDTO } from "../../modules/patients/domain/dto/patient.dto";

const patientStatusSchema = z.enum(["active", "inactive", "on_break", "discharged", "archived"]);

const getPatientsRequestSchema = z.object({
  status: z.union([patientStatusSchema, z.array(z.string())]).optional(),
  search: z.string().trim().optional(),
  isMinor: z.boolean().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  patientIds: z.array(z.uuid()).optional(),
  limit: z.number().int().positive().max(200).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type GetPatientsRequest = z.infer<typeof getPatientsRequestSchema>;
export type GetPatientsResponse = PatientsCollectionDTO;
export type GetPatientsPromise = Promise<SerializedResult<GetPatientsResponse>>;

const _getPatientsAction = createAction<GetPatientsRequest, GetPatientsResponse>({
  name: "getPatients",
  inputSchema: getPatientsRequestSchema,
  handler: async (input, context) => {
    const { userId, supabase } = context;
    const {
      status,
      search,
      isMinor,
      dateFrom,
      dateTo,
      patientIds,
      limit = 100,
      offset = 0,
    } = input;

    const repository = new PatientSupabaseRepository(supabase);
    const result = await repository.findAll(userId, {
      ...(status !== undefined ? { status } : {}),
      ...(search !== undefined ? { search } : {}),
      ...(isMinor !== undefined ? { isMinor } : {}),
      ...(dateFrom !== undefined ? { dateFrom } : {}),
      ...(dateTo !== undefined ? { dateTo } : {}),
      ...(patientIds !== undefined ? { patientIds } : {}),
      limit,
      offset,
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

/**
 * Get patients for the authenticated psychologist.
 */
export async function getPatientsAction(
  input: GetPatientsRequest,
): Promise<SerializedResult<GetPatientsResponse>> {
  const result = await _getPatientsAction(input);
  return serializeResult(result);
}
