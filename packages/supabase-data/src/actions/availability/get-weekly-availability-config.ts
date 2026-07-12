"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import type { WeeklyAvailabilityConfigDTO } from "../../modules/availability/domain/dto/availability.dto";
import { AvailabilitySupabaseRepository } from "../../modules/availability/infrastructure/repositories/availability-supabase.repository";

const getWeeklyAvailabilityConfigRequestSchema = z.object({}).strict();

export type GetWeeklyAvailabilityConfigRequest = z.infer<
  typeof getWeeklyAvailabilityConfigRequestSchema
>;
export type GetWeeklyAvailabilityConfigResponse = WeeklyAvailabilityConfigDTO;
export type GetWeeklyAvailabilityConfigPromise = Promise<
  SerializedResult<GetWeeklyAvailabilityConfigResponse>
>;

const getWeeklyAvailabilityConfig = createAction<
  GetWeeklyAvailabilityConfigRequest,
  GetWeeklyAvailabilityConfigResponse
>({
  name: "availability.getWeeklyConfig",
  inputSchema: getWeeklyAvailabilityConfigRequestSchema,
  handler: async (_input, context) => {
    const repository = new AvailabilitySupabaseRepository(context.supabase);
    const result = await repository.getWeeklyConfig(context.userId);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  },
});

export async function getWeeklyAvailabilityConfigAction(
  input: GetWeeklyAvailabilityConfigRequest = {},
): GetWeeklyAvailabilityConfigPromise {
  return serializeResult(await getWeeklyAvailabilityConfig(input));
}
