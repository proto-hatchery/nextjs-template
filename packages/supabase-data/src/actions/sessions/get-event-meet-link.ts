"use server";

import { err, ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { SessionSupabaseRepository } from "../../modules/sessions/infrastructure/repositories/session-supabase.repository";

const getEventMeetLinkRequestSchema = z.object({
  eventId: z.uuid(),
});

export type GetEventMeetLinkRequest = z.infer<typeof getEventMeetLinkRequestSchema>;
export type GetEventMeetLinkResponse = { meetLink: string | null };

const _getEventMeetLinkAction = createAction<GetEventMeetLinkRequest, GetEventMeetLinkResponse>({
  name: "sessions.getEventMeetLink",
  inputSchema: getEventMeetLinkRequestSchema,
  handler: async ({ eventId }, context) => {
    const repository = new SessionSupabaseRepository(context.supabase);
    const meetLink = await repository.getEventMeetLink(eventId);
    if (meetLink.isErr()) {
      return err(meetLink.error);
    }

    return ok({ meetLink: meetLink.value });
  },
});

export async function getEventMeetLinkAction(
  input: GetEventMeetLinkRequest,
): Promise<SerializedResult<GetEventMeetLinkResponse>> {
  const result = await _getEventMeetLinkAction(input);
  return serializeResult(result);
}
