"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";

const sendPatientInviteRequestSchema = z.object({
  patientId: z.uuid(),
  method: z.enum(["whatsapp", "sms", "email"]).optional(),
});

const resendPatientInviteRequestSchema = z.object({
  patientId: z.uuid(),
});

const cancelPatientInviteRequestSchema = z.object({
  patientId: z.uuid(),
});

const INVITE_TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateInviteToken(): string {
  let token = "";

  for (let index = 0; index < 32; index += 1) {
    token += INVITE_TOKEN_CHARS.charAt(Math.floor(Math.random() * INVITE_TOKEN_CHARS.length));
  }

  return token;
}

export type SendPatientInviteRequest = z.infer<typeof sendPatientInviteRequestSchema>;
export type ResendPatientInviteRequest = z.infer<typeof resendPatientInviteRequestSchema>;
export type CancelPatientInviteRequest = z.infer<typeof cancelPatientInviteRequestSchema>;

export interface SendPatientInviteResponse {
  inviteToken: string;
}

export interface UpdatePatientInviteResponse {
  success: boolean;
}

export type SendPatientInvitePromise = Promise<SerializedResult<SendPatientInviteResponse>>;
export type UpdatePatientInvitePromise = Promise<SerializedResult<UpdatePatientInviteResponse>>;

const _sendPatientInviteAction = createAction<SendPatientInviteRequest, SendPatientInviteResponse>({
  name: "sendPatientInvite",
  inputSchema: sendPatientInviteRequestSchema,
  handler: async (input, context) => {
    const { patientId, method = "whatsapp" } = input;
    const { userId, supabase } = context;

    const inviteToken = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        invite_token: inviteToken,
        invite_status: "pending",
        invited_at: new Date().toISOString(),
        invite_expires_at: expiresAt.toISOString(),
        invite_sent_via: method,
        invite_reminder_count: 0,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to send patient invite", {
          originalError: error.message,
        }),
      );
    }

    return ok({ inviteToken });
  },
});

export async function sendPatientInviteAction(
  input: SendPatientInviteRequest,
): Promise<SendPatientInvitePromise> {
  const result = await _sendPatientInviteAction(input);
  return serializeResult(result);
}

const _resendPatientInviteAction = createAction<
  ResendPatientInviteRequest,
  UpdatePatientInviteResponse
>({
  name: "resendPatientInvite",
  inputSchema: resendPatientInviteRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const { data: patient, error: fetchError } = await supabase
      .from("psychologist_patients")
      .select("invite_token, invite_status, invite_reminder_count")
      .eq("id", patientId)
      .eq("psychologist_id", userId)
      .single();

    if (fetchError || !patient) {
      return err(AppError.notFound(AppErrorCode.NOT_FOUND_PATIENT, "Patient not found"));
    }

    if (!patient.invite_token) {
      return err(
        AppError.validation(AppErrorCode.VALIDATION_MISSING_FIELD, "No active invite token"),
      );
    }

    if (patient.invite_status === "accepted") {
      return err(
        AppError.conflict(AppErrorCode.CONFLICT_STATE_INVALID, "Invite has already been accepted"),
      );
    }

    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        invite_reminder_sent_at: new Date().toISOString(),
        invite_reminder_count: (patient.invite_reminder_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to resend patient invite", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

export async function resendPatientInviteAction(
  input: ResendPatientInviteRequest,
): Promise<UpdatePatientInvitePromise> {
  const result = await _resendPatientInviteAction(input);
  return serializeResult(result);
}

const _cancelPatientInviteAction = createAction<
  CancelPatientInviteRequest,
  UpdatePatientInviteResponse
>({
  name: "cancelPatientInvite",
  inputSchema: cancelPatientInviteRequestSchema,
  handler: async (input, context) => {
    const { patientId } = input;
    const { userId, supabase } = context;

    const { error } = await supabase
      .from("psychologist_patients")
      .update({
        invite_status: "cancelled",
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq("id", patientId)
      .eq("psychologist_id", userId);

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to cancel patient invite", {
          originalError: error.message,
        }),
      );
    }

    return ok({ success: true });
  },
});

export async function cancelPatientInviteAction(
  input: CancelPatientInviteRequest,
): Promise<UpdatePatientInvitePromise> {
  const result = await _cancelPatientInviteAction(input);
  return serializeResult(result);
}
