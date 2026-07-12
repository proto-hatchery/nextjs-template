"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { AppError, AppErrorCode } from "../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";

const listDocumentTemplatesRequestSchema = z.object({}).strict();

export type ListDocumentTemplatesRequest = z.infer<typeof listDocumentTemplatesRequestSchema>;

export type DocumentTemplate = Database["public"]["Tables"]["catalog_document_templates"]["Row"];

export type ListDocumentTemplatesResponse = {
  templates: DocumentTemplate[];
};

export type ListDocumentTemplatesPromise = Promise<SerializedResult<ListDocumentTemplatesResponse>>;

const _listDocumentTemplates = createAction<
  ListDocumentTemplatesRequest,
  ListDocumentTemplatesResponse
>({
  name: "documents.listDocumentTemplates",
  inputSchema: listDocumentTemplatesRequestSchema,
  handler: async (_input, context) => {
    const { data, error } = await context.supabase
      .from("catalog_document_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch document templates"));
    }

    return ok({ templates: data ?? [] });
  },
});

export async function listDocumentTemplatesAction(
  input: ListDocumentTemplatesRequest,
): Promise<SerializedResult<ListDocumentTemplatesResponse>> {
  const result = await _listDocumentTemplates(input);
  return serializeResult(result);
}
