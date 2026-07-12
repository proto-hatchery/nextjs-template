"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  locationsStepSchema,
  type LocationsStepData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { upsertPsychologistLocation } from "../../../modules/psychologists/application/psychologist-commands";
import { getPsychologistLocations } from "../../../modules/psychologists/application/psychologist-queries";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const saveLocationsRequestSchema = locationsStepSchema;
const getLocationsRequestSchema = z.object({}).strict();

export type SaveLocationsRequest = LocationsStepData;
export type SaveLocationsResponse = {
  success: true;
  completedStep: "locations";
};

export type GetLocationsRequest = z.infer<typeof getLocationsRequestSchema>;
export type GetLocationsResponse = LocationsStepData;

const _saveLocations = createAction<SaveLocationsRequest, SaveLocationsResponse>({
  name: "onboarding.saveLocationsStep",
  inputSchema: saveLocationsRequestSchema,
  handler: async (input, context) => {
    if (!input.onlineOnly && input.locations.length === 0) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_INPUT,
          "Add at least one location or enable online-only attendance",
        ),
      );
    }

    for (const location of input.locations) {
      const result = await upsertPsychologistLocation(context.supabase, context.userId, {
        ...(location.id !== undefined ? { id: location.id } : {}),
        name: location.name,
        ...(location.address !== undefined ? { street: location.address } : {}),
        ...(location.isActive !== undefined ? { isActive: location.isActive } : {}),
      });

      if (result.isErr()) {
        return err(result.error);
      }
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "locations",
      nextStepId: "availability",
      draftData: {
        onlineOnly: input.onlineOnly,
      },
    });

    if (progressError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to advance onboarding step",
          progressError,
        ),
      );
    }

    return ok({ success: true, completedStep: "locations" });
  },
});

export async function saveLocationsStepAction(
  input: SaveLocationsRequest,
): Promise<SerializedResult<SaveLocationsResponse>> {
  return serializeResult(await _saveLocations(input));
}

const _getLocations = createAction<GetLocationsRequest, GetLocationsResponse>({
  name: "onboarding.getLocationsStepData",
  inputSchema: getLocationsRequestSchema,
  handler: async (_input, context) => {
    const locations = await getPsychologistLocations(context.supabase, context.userId);

    return ok({
      locations: locations.map((location) => ({
        id: location.id,
        name: location.name ?? "",
        address: [location.street, location.number, location.city, location.state]
          .filter(Boolean)
          .join(", "),
        isOnline: false,
        isActive: location.is_active ?? true,
      })),
      onlineOnly: false,
    });
  },
});

export async function getLocationsStepDataAction(
  input: GetLocationsRequest,
): Promise<SerializedResult<GetLocationsResponse>> {
  return serializeResult(await _getLocations(input));
}
