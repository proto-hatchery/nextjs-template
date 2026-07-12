"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import {
  servicesStepSchema,
  type ServicesStepData,
} from "@workspace/brand/onboarding/lib/schemas";
import { createAction } from "../../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../../lib/errors/app-error";
import { getPsychologistServices } from "../../../modules/psychologists/application/psychologist-queries";
import { upsertPsychologistService } from "../../../modules/psychologists/application/psychologist-commands";
import { advanceOnboardingStep } from "./advance-onboarding-step";

const saveServicesRequestSchema = servicesStepSchema;
const getServicesRequestSchema = z.object({}).strict();

export type SaveServicesRequest = ServicesStepData;
export type SaveServicesResponse = {
  success: true;
  completedStep: "services";
};

export type GetServicesRequest = z.infer<typeof getServicesRequestSchema>;
export type GetServicesResponse = ServicesStepData;

async function validateServiceCatalogIds(
  supabase: {
    from: (...args: unknown[]) => {
      select: (...args: unknown[]) => {
        in: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
      };
    };
  },
  ids: string[],
) {
  return supabase.from("reference_values").select("id").in("id", ids);
}

const _saveServices = createAction<SaveServicesRequest, SaveServicesResponse>({
  name: "onboarding.saveServicesStep",
  inputSchema: saveServicesRequestSchema,
  handler: async (input, context) => {
    const serviceTypeIds = [
      ...new Set(
        input.services.map(
          (service: ServicesStepData["services"][number]) => service.serviceTypeId,
        ),
      ),
    ];
    const { data: referenceRows, error: referenceError } = await validateServiceCatalogIds(
      context.supabase as never,
      serviceTypeIds,
    );

    if (referenceError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to validate service catalog",
          referenceError,
        ),
      );
    }

    const validIds = new Set(
      Array.isArray(referenceRows)
        ? referenceRows
            .map((row) =>
              typeof row === "object" && row !== null ? (row as { id?: string }).id : undefined,
            )
            .filter((value): value is string => typeof value === "string")
        : [],
    );

    const missingId = serviceTypeIds.find((id) => !validIds.has(id));
    if (missingId) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_INPUT,
          "Invalid service type selected",
          {
            serviceTypeId: missingId,
          },
        ),
      );
    }

    for (const service of input.services) {
      const result = await upsertPsychologistService(context.supabase, context.userId, {
        ...(service.id !== undefined ? { id: service.id } : {}),
        serviceId: service.serviceTypeId,
        price: service.priceInCents,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
      });

      if (result.isErr()) {
        return err(result.error);
      }
    }

    const { error: progressError } = await advanceOnboardingStep({
      supabase: context.supabase,
      userId: context.userId,
      completedStepId: "services",
      nextStepId: "locations",
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

    return ok({ success: true, completedStep: "services" });
  },
});

export async function saveServicesStepAction(
  input: SaveServicesRequest,
): Promise<SerializedResult<SaveServicesResponse>> {
  return serializeResult(await _saveServices(input));
}

const _getServices = createAction<GetServicesRequest, GetServicesResponse>({
  name: "onboarding.getServicesStepData",
  inputSchema: getServicesRequestSchema,
  handler: async (_input, context) => {
    const services = await getPsychologistServices(context.supabase, context.userId);

    return ok({
      services: services.map((service) => ({
        id: service.id,
        serviceTypeId: service.reference?.id ?? service.catalog_id ?? service.service_id ?? "",
        name: service.reference?.name ?? service.name,
        durationMinutes: Number(service.duration_minutes ?? 50),
        priceInCents: Number(service.price ?? 0),
        isActive: service.is_active,
      })),
    });
  },
});

export async function getServicesStepDataAction(
  input: GetServicesRequest,
): Promise<SerializedResult<GetServicesResponse>> {
  return serializeResult(await _getServices(input));
}
