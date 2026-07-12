import { describe, it, expect, beforeEach } from "vitest";
import { adminClient } from "../../../../tests/integration/setup";
import {
  createTestPsychologist,
  createTestPatient,
  createTestService,
  createTestLocation,
} from "../../../../tests/integration/helpers/factories";

describe("Integration: Session Creation", () => {
  let testPsychologistId: string;
  let testPatientId: string;

  beforeEach(async () => {
    const psychologist = await createTestPsychologist(adminClient);
    testPsychologistId = psychologist.id;
    const patient = await createTestPatient(adminClient, testPsychologistId);
    testPatientId = patient.id;
  });

  it("should create a basic session with required fields", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.psychologist_id).toBe(testPsychologistId);
    expect(data?.psychologist_patient_id).toBe(testPatientId);
    expect(data?.duration_minutes).toBe(50);
    expect(data?.status).toBe("scheduled");
  });

  it("should create a session with custom price", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
        snapshot_price_cents: 15000, // 150.00
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.snapshot_price_cents).toBe(15000);
  });

  it("should create a session with service reference", async () => {
    const service = await createTestService(adminClient, testPsychologistId);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
        psychologist_service_id: service.id,
        snapshot_service_name: service.name,
        snapshot_price_cents: service.price,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.psychologist_service_id).toBe(service.id);
    expect(data?.snapshot_service_name).toBe(service.name);
    expect(data?.snapshot_price_cents).toBe(service.price);
  });

  it("should create a session with location reference", async () => {
    const location = await createTestLocation(adminClient, testPsychologistId);
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
        location_id: location.id,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.location_id).toBe(location.id);
  });

  it("should create a session with notes", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
        notes: "Patient requested evening session due to work schedule",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.notes).toBe("Patient requested evening session due to work schedule");
  });

  it("should create sessions with different statuses", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const statuses = ["scheduled", "completed", "cancelled", "no_show"] as const;

    for (const status of statuses) {
      const { data, error } = await adminClient
        .from("psychologist_clinical_sessions")
        .insert({
          psychologist_id: testPsychologistId,
          psychologist_patient_id: testPatientId,
          start_time: startTime.toISOString(),
          duration_minutes: 50,
          status,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe(status);

      // Increment time to avoid conflicts
      startTime.setMinutes(startTime.getMinutes() + 60);
    }
  });

  it("should validate foreign key constraint for patient", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: "00000000-0000-0000-0000-000000000000",
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
      })
      .select()
      .single();

    expect(error).toBeDefined();
    expect(error?.message).toContain("foreign key");
  });

  it("should validate foreign key constraint for psychologist", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: "00000000-0000-0000-0000-000000000000",
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
      })
      .select()
      .single();

    expect(error).toBeDefined();
    expect(error?.message).toContain("foreign key");
  });

  it("should create session with different durations", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const durations = [30, 50, 60, 90, 120];

    for (const duration of durations) {
      const { data, error } = await adminClient
        .from("psychologist_clinical_sessions")
        .insert({
          psychologist_id: testPsychologistId,
          psychologist_patient_id: testPatientId,
          start_time: startTime.toISOString(),
          duration_minutes: duration,
          status: "scheduled",
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.duration_minutes).toBe(duration);

      // Increment time to avoid conflicts
      startTime.setMinutes(startTime.getMinutes() + duration + 10);
    }
  });

  it("should auto-generate session ID", async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const { data, error } = await adminClient
      .from("psychologist_clinical_sessions")
      .insert({
        psychologist_id: testPsychologistId,
        psychologist_patient_id: testPatientId,
        start_time: startTime.toISOString(),
        duration_minutes: 50,
        status: "scheduled",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    expect(data?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
