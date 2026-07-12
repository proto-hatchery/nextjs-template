import type { Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppError } from "../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  GeneratedDocumentWithTemplateAndPatientDTO,
  GeneratedDocumentWithTemplateDTO,
} from "../domain/dto/generated-document.dto";
import { DocumentSupabaseRepository } from "../infrastructure/repositories/document-supabase.repository";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function listGeneratedDocumentsForPatient(
  supabase: TypedSupabaseClient,
  patientId: string,
  psychologistId: string,
): Promise<Result<readonly GeneratedDocumentWithTemplateDTO[], AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.findGeneratedDocumentsByPatient(patientId, psychologistId);
}

export async function getGeneratedDocumentById(
  supabase: TypedSupabaseClient,
  documentId: string,
  psychologistId: string,
): Promise<Result<GeneratedDocumentWithTemplateAndPatientDTO | null, AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.findGeneratedDocumentById(documentId, psychologistId);
}
