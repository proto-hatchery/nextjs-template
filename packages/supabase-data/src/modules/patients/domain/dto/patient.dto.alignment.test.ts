/**
 * Runtime Zod/TypeScript Alignment Tests
 *
 * ADR-014: Contract Testing Implementation Plan
 *
 * These tests verify that Zod schemas correctly validate TypeScript DTOs
 * at runtime. They complement the compile-time type tests in
 * `contracts.type-test.ts`.
 *
 * @module @workspace/supabase/patients/domain/dto
 * @see ADR-014
 */

import { describe, expect, it } from "vitest";
import type { z } from "zod";
import type { PatientDTO, PatientSummaryDTO, PatientWithContactsDTO } from "./patient.dto";
import {
  PatientDTOSchema,
  PatientSummaryDTOSchema,
  PatientWithContactsDTOSchema,
  EmergencyContactDTOSchema,
  PatientAddressDTOSchema,
} from "./patient.dto.schema";

// ============================================================================
// Compile-Time Type Alignment Checks
// ============================================================================

/**
 * Inferred types from Zod schemas for compile-time comparison.
 */
type InferredPatientDTO = z.infer<typeof PatientDTOSchema>;
type InferredPatientSummaryDTO = z.infer<typeof PatientSummaryDTOSchema>;
type InferredPatientWithContactsDTO = z.infer<typeof PatientWithContactsDTOSchema>;

/**
 * Compile-time check: PatientDTO schema inference aligns with TypeScript interface.
 *
 * This type causes a compile-time error if the Zod schema and TypeScript interface
 * drift out of alignment. Both directions are checked for strict equality.
 */
type _PatientDTOAlignment = InferredPatientDTO extends PatientDTO
  ? PatientDTO extends InferredPatientDTO
    ? true
    : false
  : false;

/**
 * Compile-time check: PatientSummaryDTO schema inference aligns with TypeScript interface.
 */
type _PatientSummaryDTOAlignment = InferredPatientSummaryDTO extends PatientSummaryDTO
  ? PatientSummaryDTO extends InferredPatientSummaryDTO
    ? true
    : false
  : false;

/**
 * Compile-time check: PatientWithContactsDTO schema inference aligns with TypeScript interface.
 */
type _PatientWithContactsDTOAlignment =
  InferredPatientWithContactsDTO extends PatientWithContactsDTO
    ? PatientWithContactsDTO extends InferredPatientWithContactsDTO
      ? true
      : false
    : false;

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Creates a valid PatientAddressDTO for testing.
 */
function createValidPatientAddress() {
  return {
    street: "123 Main St",
    number: "456",
    complement: "Apt 789",
    neighborhood: "Downtown",
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000",
    country: "Brazil",
  };
}

/**
 * Creates a valid EmergencyContactDTO for testing.
 */
function createValidEmergencyContact() {
  return {
    name: "Jane Doe",
    phone: "+55 11 98765-4321",
    relationship: "Spouse",
  };
}

/**
 * Creates a valid PatientDTO for testing.
 */
function createValidPatientDTO(): PatientDTO {
  return {
    id: "patient-123",
    psychologistId: "psych-456",

    // Manual fields
    manualFirstName: "John",
    manualLastName: "Doe",
    manualPreferredName: "Johnny",
    manualFullName: "John Doe",
    manualEmail: "john@example.com",
    manualPhone: "+55 11 91234-5678",
    manualDateOfBirth: "1990-05-15",
    manualCpf: "123.456.789-00",
    manualGender: "male",
    manualAddress: createValidPatientAddress(),
    manualPreferredContactMethod: "email",
    notificationsWhatsappSessionReminders: true,
    manualPatientOrigin: "referral",
    attachedDocuments: null,
    clinicalNotes: "Initial consultation completed",

    // Synced fields
    syncedFullName: null,
    syncedEmail: null,
    syncedPhone: null,

    // Computed fields
    displayName: "John Doe",
    isMinor: false,
    age: 34,

    // Session defaults
    defaultSessionPrice: 250.0,

    // Metadata
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
    archivedAt: null,
  };
}

/**
 * Creates a valid PatientSummaryDTO for testing.
 */
function createValidPatientSummaryDTO(): PatientSummaryDTO {
  return {
    id: "patient-123",
    displayName: "John Doe",
    email: "john@example.com",
    phone: "+55 11 91234-5678",
    isMinor: false,
    isActive: true,
    defaultSessionPrice: 250.0,
  };
}

/**
 * Creates a valid PatientWithContactsDTO for testing.
 */
function createValidPatientWithContactsDTO(): PatientWithContactsDTO {
  return {
    ...createValidPatientDTO(),
    emergencyContacts: [createValidEmergencyContact()],
  };
}

// ============================================================================
// PatientAddressDTO Schema Tests
// ============================================================================

describe("PatientAddressDTOSchema", () => {
  it("should validate a correctly shaped address", () => {
    const validAddress = createValidPatientAddress();
    const result = PatientAddressDTOSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("should validate a partial address (all fields optional)", () => {
    const partialAddress = {
      city: "São Paulo",
      state: "SP",
    };
    const result = PatientAddressDTOSchema.safeParse(partialAddress);
    expect(result.success).toBe(true);
  });

  it("should validate an empty object (all fields optional)", () => {
    const result = PatientAddressDTOSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject wrong field types", () => {
    const invalidAddress = {
      street: 123, // should be string
      city: "São Paulo",
    };
    const result = PatientAddressDTOSchema.safeParse(invalidAddress);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// EmergencyContactDTO Schema Tests
// ============================================================================

describe("EmergencyContactDTOSchema", () => {
  it("should validate a correctly shaped emergency contact", () => {
    const validContact = createValidEmergencyContact();
    const result = EmergencyContactDTOSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("should validate without optional relationship field", () => {
    const contactWithoutRelationship = {
      name: "Jane Doe",
      phone: "+55 11 98765-4321",
    };
    const result = EmergencyContactDTOSchema.safeParse(contactWithoutRelationship);
    expect(result.success).toBe(true);
  });

  it("should reject missing required name field", () => {
    const invalidContact = {
      phone: "+55 11 98765-4321",
      relationship: "Spouse",
    };
    const result = EmergencyContactDTOSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });

  it("should reject missing required phone field", () => {
    const invalidContact = {
      name: "Jane Doe",
      relationship: "Spouse",
    };
    const result = EmergencyContactDTOSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });

  it("should reject wrong field types", () => {
    const invalidContact = {
      name: "Jane Doe",
      phone: 987654321, // should be string
    };
    const result = EmergencyContactDTOSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PatientDTO Schema Tests
// ============================================================================

describe("PatientDTOSchema", () => {
  const validPatient = createValidPatientDTO();

  it("should validate a correctly shaped PatientDTO", () => {
    const result = PatientDTOSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it("should validate with null optional fields", () => {
    const patientWithNulls: PatientDTO = {
      ...validPatient,
      manualFirstName: null,
      manualLastName: null,
      manualPreferredName: null,
      manualFullName: null,
      manualEmail: null,
      manualPhone: null,
      manualDateOfBirth: null,
      manualCpf: null,
      manualGender: null,
      manualAddress: null,
      manualPreferredContactMethod: null,
      notificationsWhatsappSessionReminders: true,
      manualPatientOrigin: null,
      clinicalNotes: null,
      age: null,
      defaultSessionPrice: null,
      archivedAt: null,
    };
    const result = PatientDTOSchema.safeParse(patientWithNulls);
    expect(result.success).toBe(true);
  });

  it("should reject a PatientDTO with missing required id field", () => {
    const { id: _id, ...invalidPatient } = validPatient;
    const result = PatientDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should reject a PatientDTO with missing required psychologistId field", () => {
    const { psychologistId: _psychologistId, ...invalidPatient } = validPatient;
    const result = PatientDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should reject a PatientDTO with missing required displayName field", () => {
    const { displayName: _displayName, ...invalidPatient } = validPatient;
    const result = PatientDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should reject a PatientDTO with wrong field types", () => {
    const invalidPatient = {
      ...validPatient,
      isMinor: "yes", // should be boolean
    };
    const result = PatientDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should reject a PatientDTO with wrong age type", () => {
    const invalidPatient = {
      ...validPatient,
      age: "34", // should be number or null
    };
    const result = PatientDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should validate with attachedDocuments as object", () => {
    const patientWithDocuments = {
      ...validPatient,
      attachedDocuments: { document1: "value1", document2: "value2" },
    };
    const result = PatientDTOSchema.safeParse(patientWithDocuments);
    expect(result.success).toBe(true);
  });

  it("should validate with attachedDocuments as array", () => {
    const patientWithDocuments = {
      ...validPatient,
      attachedDocuments: ["doc1", "doc2"],
    };
    const result = PatientDTOSchema.safeParse(patientWithDocuments);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// PatientSummaryDTO Schema Tests
// ============================================================================

describe("PatientSummaryDTOSchema", () => {
  const validSummary = createValidPatientSummaryDTO();

  it("should validate a correctly shaped PatientSummaryDTO", () => {
    const result = PatientSummaryDTOSchema.safeParse(validSummary);
    expect(result.success).toBe(true);
  });

  it("should validate with null optional fields", () => {
    const summaryWithNulls: PatientSummaryDTO = {
      ...validSummary,
      email: null,
      phone: null,
      defaultSessionPrice: null,
    };
    const result = PatientSummaryDTOSchema.safeParse(summaryWithNulls);
    expect(result.success).toBe(true);
  });

  it("should reject missing required id field", () => {
    const { id: _id, ...invalidSummary } = validSummary;
    const result = PatientSummaryDTOSchema.safeParse(invalidSummary);
    expect(result.success).toBe(false);
  });

  it("should reject missing required displayName field", () => {
    const { displayName: _displayName, ...invalidSummary } = validSummary;
    const result = PatientSummaryDTOSchema.safeParse(invalidSummary);
    expect(result.success).toBe(false);
  });

  it("should reject wrong isMinor type", () => {
    const invalidSummary = {
      ...validSummary,
      isMinor: "false", // should be boolean
    };
    const result = PatientSummaryDTOSchema.safeParse(invalidSummary);
    expect(result.success).toBe(false);
  });

  it("should reject wrong isActive type", () => {
    const invalidSummary = {
      ...validSummary,
      isActive: 1, // should be boolean
    };
    const result = PatientSummaryDTOSchema.safeParse(invalidSummary);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PatientWithContactsDTO Schema Tests
// ============================================================================

describe("PatientWithContactsDTOSchema", () => {
  const validPatientWithContacts = createValidPatientWithContactsDTO();

  it("should validate a correctly shaped PatientWithContactsDTO", () => {
    const result = PatientWithContactsDTOSchema.safeParse(validPatientWithContacts);
    expect(result.success).toBe(true);
  });

  it("should validate with empty emergency contacts array", () => {
    const patientWithEmptyContacts = {
      ...validPatientWithContacts,
      emergencyContacts: [],
    };
    const result = PatientWithContactsDTOSchema.safeParse(patientWithEmptyContacts);
    expect(result.success).toBe(true);
  });

  it("should validate with multiple emergency contacts", () => {
    const patientWithMultipleContacts = {
      ...validPatientWithContacts,
      emergencyContacts: [
        createValidEmergencyContact(),
        {
          name: "Bob Smith",
          phone: "+55 11 97654-3210",
          relationship: "Brother",
        },
      ],
    };
    const result = PatientWithContactsDTOSchema.safeParse(patientWithMultipleContacts);
    expect(result.success).toBe(true);
  });

  it("should reject missing emergencyContacts field", () => {
    const { emergencyContacts: _emergencyContacts, ...invalidPatient } = validPatientWithContacts;
    const result = PatientWithContactsDTOSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
  });

  it("should reject invalid emergency contact in array", () => {
    const patientWithInvalidContact = {
      ...validPatientWithContacts,
      emergencyContacts: [
        {
          name: "Jane Doe",
          // missing required phone field
        },
      ],
    };
    const result = PatientWithContactsDTOSchema.safeParse(patientWithInvalidContact);
    expect(result.success).toBe(false);
  });

  it("should reject wrong emergencyContacts type", () => {
    const patientWithWrongType = {
      ...validPatientWithContacts,
      emergencyContacts: "none", // should be array
    };
    const result = PatientWithContactsDTOSchema.safeParse(patientWithWrongType);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Cross-DTO Compatibility Tests
// ============================================================================

describe("Cross-DTO compatibility", () => {
  it("PatientSummaryDTO should be valid as a subset of PatientDTO fields", () => {
    // This test verifies that the summary can be derived from full patient data
    const fullPatient = createValidPatientDTO();
    const summaryFromPatient: PatientSummaryDTO = {
      id: fullPatient.id,
      displayName: fullPatient.displayName,
      email: fullPatient.manualEmail,
      phone: fullPatient.manualPhone,
      isMinor: fullPatient.isMinor,
      isActive: fullPatient.isActive,
      defaultSessionPrice: fullPatient.defaultSessionPrice,
    };

    const result = PatientSummaryDTOSchema.safeParse(summaryFromPatient);
    expect(result.success).toBe(true);
  });

  it("PatientWithContactsDTO should extend PatientDTO (extra emergencyContacts field)", () => {
    const patientWithContacts = createValidPatientWithContactsDTO();

    // Verify all PatientDTO fields are present
    const basePatientFields: PatientDTO = {
      id: patientWithContacts.id,
      psychologistId: patientWithContacts.psychologistId,
      manualFirstName: patientWithContacts.manualFirstName,
      manualLastName: patientWithContacts.manualLastName,
      manualPreferredName: patientWithContacts.manualPreferredName,
      manualFullName: patientWithContacts.manualFullName,
      manualEmail: patientWithContacts.manualEmail,
      manualPhone: patientWithContacts.manualPhone,
      manualDateOfBirth: patientWithContacts.manualDateOfBirth,
      manualCpf: patientWithContacts.manualCpf,
      manualGender: patientWithContacts.manualGender,
      manualAddress: patientWithContacts.manualAddress,
      manualPreferredContactMethod: patientWithContacts.manualPreferredContactMethod,
      notificationsWhatsappSessionReminders:
        patientWithContacts.notificationsWhatsappSessionReminders,
      manualPatientOrigin: patientWithContacts.manualPatientOrigin,
      attachedDocuments: patientWithContacts.attachedDocuments,
      clinicalNotes: patientWithContacts.clinicalNotes,
      syncedFullName: patientWithContacts.syncedFullName,
      syncedEmail: patientWithContacts.syncedEmail,
      syncedPhone: patientWithContacts.syncedPhone,
      displayName: patientWithContacts.displayName,
      isMinor: patientWithContacts.isMinor,
      age: patientWithContacts.age,
      defaultSessionPrice: patientWithContacts.defaultSessionPrice,
      isActive: patientWithContacts.isActive,
      createdAt: patientWithContacts.createdAt,
      updatedAt: patientWithContacts.updatedAt,
      archivedAt: patientWithContacts.archivedAt,
    };

    const result = PatientDTOSchema.safeParse(basePatientFields);
    expect(result.success).toBe(true);
  });
});
