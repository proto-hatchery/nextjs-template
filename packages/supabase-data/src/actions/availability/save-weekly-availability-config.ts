"use server";

import { err, ok } from "neverthrow";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { validateWeeklyAvailabilityInput } from "../../modules/availability/application/availability-validation";
import { AvailabilitySupabaseRepository } from "../../modules/availability/infrastructure/repositories/availability-supabase.repository";
import {
  weeklyConfigSchema,
  type SaveWeeklyAvailabilityConfigInput,
} from "../../utils/validation-schemas";

export type SaveWeeklyAvailabilityConfigRequest = SaveWeeklyAvailabilityConfigInput;
export type SaveWeeklyAvailabilityConfigResponse = { success: true };
export type SaveWeeklyAvailabilityConfigPromise = Promise<
  SerializedResult<SaveWeeklyAvailabilityConfigResponse>
>;

const saveWeeklyAvailabilityConfig = createAction<
  SaveWeeklyAvailabilityConfigRequest,
  SaveWeeklyAvailabilityConfigResponse
>({
  name: "availability.saveWeeklyAvailabilityConfig",
  inputSchema: weeklyConfigSchema,
  handler: async (input, context) => {
    const validationError = validateWeeklyAvailabilityInput(input);
    if (validationError) {
      return err(validationError);
    }

    const repository = new AvailabilitySupabaseRepository(context.supabase);
    const result = await repository.saveWeeklyConfig(context.userId, input);
    if (result.isErr()) {
      return err(result.error);
    }

    return ok({ success: true });
  },
});

export async function saveWeeklyAvailabilityConfigAction(
  input: SaveWeeklyAvailabilityConfigRequest,
): SaveWeeklyAvailabilityConfigPromise {
  return serializeResult(await saveWeeklyAvailabilityConfig(input));
}
