"use server";

import { updatePatientActivityAction } from "./update-patient-activity";
import type { SerializedResult } from "../../lib/boundary/serialize-result";
import type { PatientActivityAssignment } from "../../types/entities";

export type ArchivePatientActivityRequest = {
  assignmentId: string;
  isArchived: boolean;
};

export type ArchivePatientActivityResponse = {
  activity: PatientActivityAssignment;
};

export type ArchivePatientActivityPromise = Promise<
  SerializedResult<ArchivePatientActivityResponse>
>;

/**
 * Archive or unarchive a patient activity assignment
 */
export async function archivePatientActivity(
  request: ArchivePatientActivityRequest,
): Promise<SerializedResult<ArchivePatientActivityResponse>> {
  return updatePatientActivityAction({
    assignmentId: request.assignmentId,
    updates: {
      is_archived: request.isArchived,
    },
  });
}
