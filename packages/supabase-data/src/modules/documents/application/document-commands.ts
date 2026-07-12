import type { Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppError } from "../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CreateGeneratedDocumentDTO,
  GeneratedDocumentDTO,
} from "../domain/dto/generated-document.dto";
import { DocumentSupabaseRepository } from "../infrastructure/repositories/document-supabase.repository";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function createGeneratedDocument(
  supabase: TypedSupabaseClient,
  input: CreateGeneratedDocumentDTO,
): Promise<Result<GeneratedDocumentDTO, AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.createGeneratedDocument(input);
}

export async function updateGeneratedDocument(
  supabase: TypedSupabaseClient,
  documentId: string,
  psychologistId: string,
  updates: Partial<Pick<GeneratedDocumentDTO, "title" | "encodedContent">>,
): Promise<Result<GeneratedDocumentDTO, AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.updateGeneratedDocument(documentId, psychologistId, updates);
}

export async function renameGeneratedDocument(
  supabase: TypedSupabaseClient,
  documentId: string,
  psychologistId: string,
  title: string,
): Promise<Result<GeneratedDocumentDTO, AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.renameGeneratedDocument(documentId, psychologistId, title);
}

export async function deleteGeneratedDocument(
  supabase: TypedSupabaseClient,
  documentId: string,
  psychologistId: string,
): Promise<Result<void, AppError>> {
  const repository = new DocumentSupabaseRepository(supabase);
  return repository.deleteGeneratedDocument(documentId, psychologistId);
}
