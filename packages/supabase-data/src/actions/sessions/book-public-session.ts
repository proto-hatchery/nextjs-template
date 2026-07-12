"use server";

import { z } from "zod";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { createAction } from "../../lib/boundary/create-action";
import {
  bookPublicSession,
  type BookPublicSessionInput,
} from "../../modules/sessions/application/session-commands";
import type { SessionResult } from "../../types/entities";

export type BookPublicSessionRequest = BookPublicSessionInput;
export type BookPublicSessionResponse = SessionResult;

const bookPublicSessionRequestSchema = z.custom<BookPublicSessionRequest>();

const _bookPublicSessionAction = createAction<BookPublicSessionRequest, BookPublicSessionResponse>({
  name: "sessions.bookPublicSession",
  inputSchema: bookPublicSessionRequestSchema,
  requireAuth: false,
  handler: async (input, context) => {
    return bookPublicSession(context.supabase, input);
  },
});

export async function bookPublicSessionAction(
  input: BookPublicSessionRequest,
): Promise<SerializedResult<BookPublicSessionResponse>> {
  const result = await _bookPublicSessionAction(input);
  return serializeResult(result);
}
