"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";

import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import { verifyPatientOwnership } from "../../utils/authorization";
import { validateFile, validateFileContent } from "../../utils/file-validation";

const uploadPatientTestResultFileRequestSchema = z
  .object({
    file: z.instanceof(File),
    patientId: z.uuid(),
    testId: z.uuid(),
  })
  .strict();

const getPatientTestResultSignedUrlRequestSchema = z
  .object({
    expiresIn: z
      .number()
      .int()
      .positive()
      .max(60 * 60 * 24)
      .optional(),
    testId: z.uuid(),
  })
  .strict();

export type UploadPatientTestResultFileRequest = z.infer<
  typeof uploadPatientTestResultFileRequestSchema
>;
export type GetPatientTestResultSignedUrlRequest = z.infer<
  typeof getPatientTestResultSignedUrlRequestSchema
>;

export type UploadPatientTestResultFileResponse = {
  filePath: string;
};

export type GetPatientTestResultSignedUrlResponse = {
  signedUrl: string;
};

const _uploadPatientTestResultFileAction = createAction<
  UploadPatientTestResultFileRequest,
  UploadPatientTestResultFileResponse
>({
  name: "patients.uploadPatientTestResultFile",
  inputSchema: uploadPatientTestResultFileRequestSchema,
  handler: async (input, context) => {
    const { file, patientId, testId } = input;
    const { supabase, userId } = context;

    const isOwner = await verifyPatientOwnership(supabase, userId, patientId);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    const validation = validateFile(file, "test_result");
    if (!validation.valid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          validation.error ?? "Invalid file",
        ),
      );
    }

    const contentValidation = await validateFileContent(file, validation.mimeType);
    if (!contentValidation.valid) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          contentValidation.error ?? "Invalid file content",
        ),
      );
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("psychologist_patient_assessments")
      .select("id, patient_id")
      .eq("id", testId)
      .eq("patient_id", patientId)
      .eq("psychologist_id", userId)
      .single();

    if (assessmentError || !assessment) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_RESOURCE,
          "Patient test not found",
          "patient_test",
          testId,
        ),
      );
    }

    const fileExt = validation.sanitizedName.split(".").pop()?.toLowerCase();
    if (!fileExt) {
      return err(
        AppError.validation(
          AppErrorCode.VALIDATION_INVALID_FORMAT,
          "File must have a valid extension",
        ),
      );
    }

    const filePath = `${patientId}/${testId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("test-results")
      .upload(filePath, file, {
        contentType: validation.mimeType,
        upsert: true,
      });

    if (uploadError) {
      return err(
        AppError.infra(AppErrorCode.DOCUMENTS_UPLOAD_FAILED, "Failed to upload patient test file", {
          originalError: uploadError.message,
        }),
      );
    }

    const { error: updateError } = await supabase
      .from("psychologist_patient_assessments")
      .update({ file_url: filePath })
      .eq("id", testId)
      .eq("patient_id", patientId)
      .eq("psychologist_id", userId);

    if (updateError) {
      await supabase.storage.from("test-results").remove([filePath]);
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to persist uploaded patient test file",
          { originalError: updateError.message },
        ),
      );
    }

    return ok({ filePath });
  },
});

const _getPatientTestResultSignedUrlAction = createAction<
  GetPatientTestResultSignedUrlRequest,
  GetPatientTestResultSignedUrlResponse
>({
  name: "patients.getPatientTestResultSignedUrl",
  inputSchema: getPatientTestResultSignedUrlRequestSchema,
  handler: async (input, context) => {
    const { expiresIn = 3600, testId } = input;
    const { supabase, userId } = context;

    const { data: assessment, error: assessmentError } = await supabase
      .from("psychologist_patient_assessments")
      .select("file_url, patient_id")
      .eq("id", testId)
      .eq("psychologist_id", userId)
      .single();

    if (assessmentError || !assessment) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_RESOURCE,
          "Patient test not found",
          "patient_test",
          testId,
        ),
      );
    }

    if (!assessment.patient_id) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_RESOURCE,
          "Patient test is not linked to a patient",
          "patient_test",
          testId,
        ),
      );
    }

    const isOwner = await verifyPatientOwnership(supabase, userId, assessment.patient_id);
    if (!isOwner) {
      return err(
        AppError.auth(
          AppErrorCode.AUTH_FORBIDDEN,
          "You do not have permission to access this patient",
        ),
      );
    }

    if (!assessment.file_url) {
      return err(
        AppError.notFound(
          AppErrorCode.NOT_FOUND_RESOURCE,
          "Patient test file not found",
          "patient_test_file",
          testId,
        ),
      );
    }

    const { data, error } = await supabase.storage
      .from("test-results")
      .createSignedUrl(assessment.file_url, expiresIn);

    if (error || !data?.signedUrl) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to create signed URL", {
          originalError: error?.message,
        }),
      );
    }

    return ok({ signedUrl: data.signedUrl });
  },
});

export async function uploadPatientTestResultFileAction(
  input: UploadPatientTestResultFileRequest,
): Promise<SerializedResult<UploadPatientTestResultFileResponse>> {
  const result = await _uploadPatientTestResultFileAction(input);
  return serializeResult(result);
}

export async function getPatientTestResultSignedUrlAction(
  input: GetPatientTestResultSignedUrlRequest,
): Promise<SerializedResult<GetPatientTestResultSignedUrlResponse>> {
  const result = await _getPatientTestResultSignedUrlAction(input);
  return serializeResult(result);
}
