import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { OnboardingRepository } from "../../domain/ports/onboarding-repository.port";
import type {
  CompleteOnboardingDTO,
  CompleteOnboardingPhaseDTO,
  DetailedOnboardingStatusDTO,
  OnboardingDraftStateDTO,
  OnboardingPhase,
  OnboardingPhaseDraftDTO,
  OnboardingProgressDTO,
} from "../../domain/dto/onboarding-state.dto";
import {
  mergeOnboardingDraftData,
  mergePhaseDraftData,
  toDetailedOnboardingStatusDTO,
  toOnboardingDraftStateDTO,
  toOnboardingPhaseDraftDTO,
  toOnboardingProgressDTO,
} from "../mappers/onboarding.mapper";

type OnboardingStateInsert =
  Database["public"]["Tables"]["psychologist_onboarding_state"]["Insert"];

export class OnboardingSupabaseRepository implements OnboardingRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getDraft(userId: string): Promise<Result<OnboardingDraftStateDTO, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .select("current_step_id, step_drafts")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    return ok(toOnboardingDraftStateDTO(data));
  }

  async saveDraft(
    userId: string,
    step: number,
    data: Record<string, unknown>,
  ): Promise<Result<OnboardingDraftStateDTO, AppErrorType>> {
    const { data: existingDraft, error: fetchError } = await this.supabase
      .from("psychologist_onboarding_state")
      .select("step_drafts")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (fetchError) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, fetchError.message, fetchError));
    }

    const mergedData = mergeOnboardingDraftData(
      existingDraft?.step_drafts as Record<string, unknown> | null,
      data,
    );
    const upsertData: OnboardingStateInsert = {
      psychologist_id: userId,
      current_step: step,
      step_drafts: mergedData as Exclude<OnboardingStateInsert["step_drafts"], undefined>,
      updated_at: new Date().toISOString(),
    };

    const { data: savedState, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .upsert(upsertData, { onConflict: "psychologist_id" })
      .select("current_step_id, step_drafts")
      .single();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    return ok(toOnboardingDraftStateDTO(savedState));
  }

  async autoSavePhaseDraft(
    userId: string,
    phase: OnboardingPhase,
    draftData: Record<string, unknown>,
  ): Promise<Result<CompleteOnboardingPhaseDTO, AppErrorType>> {
    const { data: currentState, error: fetchError } = await this.supabase
      .from("psychologist_onboarding_state")
      .select("step_drafts")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (fetchError) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch current draft state",
          fetchError,
        ),
      );
    }

    const mergedDraft = mergePhaseDraftData(
      currentState?.step_drafts as Record<string, unknown> | null,
      phase,
      draftData,
    );

    const { error: upsertError } = await this.supabase.from("psychologist_onboarding_state").upsert(
      {
        psychologist_id: userId,
        step_drafts: mergedDraft as Exclude<OnboardingStateInsert["step_drafts"], undefined>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "psychologist_id" },
    );

    if (upsertError) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to auto-save phase draft", upsertError),
      );
    }

    return ok({ lastSavedAt: new Date().toISOString() });
  }

  async completeOnboarding(): Promise<Result<CompleteOnboardingDTO, AppErrorType>> {
    return ok({ success: true });
  }

  async getStatus(userId: string): Promise<Result<boolean, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("user_psychologists")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    return ok(data?.onboarding_completed ?? false);
  }

  async getProgress(userId: string): Promise<Result<OnboardingProgressDTO, AppErrorType>> {
    // Use the same view that can_user_access_app() uses for single source of truth
    const { data, error } = await this.supabase
      .from("psychologist_onboarding_summary")
      .select("*")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    // Pass the raw row to the mapper, it will handle the logic locally
    return ok(toOnboardingProgressDTO(data as any));
  }

  async getPhaseDraft(
    userId: string,
    phase: OnboardingPhase,
  ): Promise<Result<OnboardingPhaseDraftDTO, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .select("step_drafts")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch draft", error));
    }

    return ok(
      toOnboardingPhaseDraftDTO(data?.step_drafts as Record<string, unknown> | null, phase),
    );
  }

  async completePhase(
    userId: string,
    phase: OnboardingPhase,
  ): Promise<Result<CompleteOnboardingPhaseDTO, AppErrorType>> {
    const { error } = await this.supabase.rpc("complete_onboarding_phase", {
      p_psychologist_id: userId,
      p_phase: phase,
    });

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    return ok({ lastSavedAt: new Date().toISOString() });
  }

  async getDetailedStatus(
    userId: string,
  ): Promise<Result<DetailedOnboardingStatusDTO, AppErrorType>> {
    const { data, error } = await this.supabase
      .from("psychologist_onboarding_state")
      .select("completed_steps, current_step_id, onboarding_completed_at, completion_percentage")
      .eq("psychologist_id", userId)
      .maybeSingle();

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, error.message, error));
    }

    return ok(toDetailedOnboardingStatusDTO(data));
  }
}
