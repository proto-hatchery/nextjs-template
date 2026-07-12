"use server";

import { ok } from "neverthrow";
import { z } from "zod";
import { createAction } from "../../lib/boundary/create-action";
import { serializeResult, type SerializedResult } from "../../lib/boundary/serialize-result";
import { checkCalendarConflicts } from "../../modules/calendar/application/calendar-queries";

const checkConflictsRequestSchema = z.object({
  startDatetime: z.string().datetime(),
  endDatetime: z.string().datetime(),
  excludeEventId: z.uuid().optional(),
});

export type CheckConflictsRequest = z.infer<typeof checkConflictsRequestSchema>;
export type CalendarConflict = {
  eventId: string;
  eventTitle: string;
  startTime: string;
  endTime: string;
};
export type CheckConflictsResponse = { conflicts: CalendarConflict[] };

const _checkConflictsAction = createAction<CheckConflictsRequest, CheckConflictsResponse>({
  name: "calendar.checkConflicts",
  inputSchema: checkConflictsRequestSchema,
  handler: async (input, context) => {
    const conflicts = await checkCalendarConflicts(
      context.supabase,
      context.userId,
      input.startDatetime,
      input.endDatetime,
      input.excludeEventId,
    );

    return ok({
      conflicts: conflicts.map((conflict) => ({
        eventId: conflict.id,
        eventTitle: conflict.title,
        startTime: conflict.start_datetime,
        endTime: conflict.end_datetime,
      })),
    });
  },
});

export async function checkConflictsAction(
  input: CheckConflictsRequest,
): Promise<SerializedResult<CheckConflictsResponse>> {
  const result = await _checkConflictsAction(input);
  return serializeResult(result);
}
