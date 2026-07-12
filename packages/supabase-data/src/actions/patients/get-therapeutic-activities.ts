"use server";

import { createAction } from "../../lib/boundary/create-action";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { err, ok } from "neverthrow";
import { z } from "zod";
import type { ActivityReference } from "../../types/entities";

// ============================================================================
// Types
// ============================================================================

export type GetTherapeuticActivitiesRequest = Record<string, never>;

export type GetTherapeuticActivitiesResponse = {
  activities: ActivityReference[];
};

export type GetTherapeuticActivitiesPromise = Promise<
  SerializedResult<GetTherapeuticActivitiesResponse>
>;

// ============================================================================
// Schema
// ============================================================================

const getTherapeuticActivitiesSchema = z.object({});

// ============================================================================
// Action
// ============================================================================

const _getTherapeuticActivitiesAction = createAction<
  GetTherapeuticActivitiesRequest,
  GetTherapeuticActivitiesResponse
>({
  name: "getTherapeuticActivities",
  inputSchema: getTherapeuticActivitiesSchema,
  requireAuth: false,
  handler: async (_input, context) => {
    const { supabase } = context;

    const { data, error } = await supabase
      .from("catalog_clinical_activities")
      .select(
        "id, code, name, description, active, pdf_path, activity_kind, clinician_notes_template, delivery_modes, duration_min, goals, image_path, materials_json, populations, risk_level, tags, created_at, updated_at",
      )
      .order("name", { ascending: true });

    if (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          `Erro ao buscar atividades terapêuticas: ${error.message}`,
        ),
      );
    }

    const activities = data as unknown as ActivityReference[];

    return ok({
      activities,
    });
  },
});

/**
 * Get all therapeutic activities from catalog
 * Public endpoint - no auth required
 */
export async function getTherapeuticActivitiesAction(
  input: GetTherapeuticActivitiesRequest,
): Promise<SerializedResult<GetTherapeuticActivitiesResponse>> {
  const result = await _getTherapeuticActivitiesAction(input);
  return serializeResult(result);
}
