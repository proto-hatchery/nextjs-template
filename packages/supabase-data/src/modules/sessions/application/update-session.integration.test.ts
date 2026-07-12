import { describe, it, expect, beforeEach } from "vitest";
import { adminClient } from "../../../../tests/integration/setup";
import {
  createTestPsychologist,
  createTestPatient,
  createTestSession,
  createTestService,
  createTestLocation,
} from "../../../../tests/integration/helpers/factories";

describe("Integration: Session Update", () => {
  let testPsychologistId: string;
  let testPatientId: string;
  let testSessionId: string;

  beforeEach(async () => {
    const psychologist = await createTestPsychologist(adminClient);
    testPsychologistId = psychologist.id;
    const patient = await createTestPatient(adminClient, testPsychologistId);
    testPatientId = patient.id;
    const session = await createTestSession(adminClient, testPsychologistId, testPatientId);
    testSessionId = session.id;
  });

  it("should update session start time", async () => {
    const newStartTime = new Date();
    newStartTime.setHours(newStartTime.getHours() + 5);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        start_time: newStartTime.toISOString(),
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(new Date(data!.start_time).getTime()).toBe(newStartTime.getTime());
  });

  it("should update session duration", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        duration_minutes: 90,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.duration_minutes).toBe(90);
  });

  it("should update session status", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        status: "completed",
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.status).toBe("completed");
  });

  it("should update session notes", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        notes: "Updated session notes",
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.notes).toBe("Updated session notes");
  });

  it("should update session with new service", async () => {
    const service = await createTestService(adminClient, testPsychologistId, {
      name: "Updated Service",
      price: 20000,
    });

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        psychologist_service_id: service.id,
        snapshot_service_name: service.name,
        snapshot_price_cents: service.price,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.psychologist_service_id).toBe(service.id);
    expect(data?.snapshot_service_name).toBe("Updated Service");
    expect(data?.snapshot_price_cents).toBe(20000);
  });

  it("should update session location", async () => {
    const location = await createTestLocation(adminClient, testPsychologistId, {
      name: "New Office",
    });

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        location_id: location.id,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.location_id).toBe(location.id);
  });

  it("should update attendance confirmation", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        attendance_confirmed: true,
        confirmation_sent_at: new Date().toISOString(),
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.attendance_confirmed).toBe(true);
    expect(data?.confirmation_sent_at).toBeDefined();
  });

  it("should update custom price", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        snapshot_price_cents: 17500,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.snapshot_price_cents).toBe(17500);
  });

  it("should not update session belonging to different psychologist", async () => {
    const psychologist2 = await createTestPsychologist(adminClient);

    const { data } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        notes: "Hacked",
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", psychologist2.id)
      .select()
      .single();

    // Should return no rows affected
    expect(data).toBeNull();
  });

  it("should update reminder sent timestamp", async () => {
    const reminderTime = new Date().toISOString();

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        reminder_sent_at: reminderTime,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.reminder_sent_at).toBe(reminderTime);
  });

  it("should update session number", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        session_number: 5,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.session_number).toBe(5);
  });

  it("should handle null values for optional fields", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        notes: null,
        snapshot_price_cents: null,
        location_id: null,
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.notes).toBeNull();
    expect(data?.snapshot_price_cents).toBeNull();
    expect(data?.location_id).toBeNull();
  });

  it("should update billing status", async () => {
    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        billing_status: "pending",
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.billing_status).toBe("pending");
  });

  it("should maintain updated_at timestamp", async () => {
    const beforeUpdate = new Date();

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .update({
        notes: "Timestamp test",
      })
      .eq("id", testSessionId)
      .eq("psychologist_id", testPsychologistId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.updated_at).toBeDefined();
    const updatedAt = new Date(data!.updated_at!);
    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
  });
});
