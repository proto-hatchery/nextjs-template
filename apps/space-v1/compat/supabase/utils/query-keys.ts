/**
 * Centralized query keys for TanStack Query.
 * All query keys should be defined here to ensure consistency
 * and enable proper cache invalidation across the application.
 */

import type {
  ChargeFilters,
  FindPsychologistFilters,
  FinancialEntryFilters,
  FinancialPeriod,
  NoteFilters,
  PatientFilters,
  SessionFilters,
  CalendarEventFilters,
  CalendarEventSeriesFilters,
  CalendarEventType,
  GoogleSyncLogFilters,
} from "@workspace/supabase-data/types/entities";

export const queryKeys = {
  // ============================================
  // CATALOGS - Global reference data (rarely changes)
  // ============================================
  catalogs: {
    all: ["catalogs"] as const,
    services: () => [...queryKeys.catalogs.all, "services"] as const,
    specialties: () => [...queryKeys.catalogs.all, "specialties"] as const,
    approaches: () => [...queryKeys.catalogs.all, "approaches"] as const,
    cancellationPolicies: () => [...queryKeys.catalogs.all, "cancellation-policies"] as const,
    activities: () => [...queryKeys.catalogs.all, "activities"] as const,
    disorders: () => [...queryKeys.catalogs.all, "disorders"] as const,
    medications: () => [...queryKeys.catalogs.all, "medications"] as const,
    full: () => [...queryKeys.catalogs.all, "full"] as const,
  },

  // ============================================
  // USER - Current user data
  // ============================================
  user: {
    current: () => ["user", "current"] as const,
  },

  // ============================================
  // PSYCHOLOGIST - Current logged-in psychologist data
  // ============================================
  psychologist: {
    all: ["psychologist"] as const,
    profile: (id?: string) =>
      id
        ? ([...queryKeys.psychologist.all, "profile", id] as const)
        : ([...queryKeys.psychologist.all, "profile"] as const),
    onboarding: () => [...queryKeys.psychologist.all, "onboarding"] as const,
    onboardingSummary: () => [...queryKeys.psychologist.all, "onboarding-summary"] as const,
    services: () => [...queryKeys.psychologist.all, "services"] as const,
    locations: () => [...queryKeys.psychologist.all, "locations"] as const,
    extendedProfile: () => [...queryKeys.psychologist.all, "extended-profile"] as const,
    linktreeLinks: () => [...queryKeys.psychologist.all, "linktree-links"] as const,
    linktree: (slug: string) => [...queryKeys.psychologist.all, "linktree", slug] as const,
    cancellationPolicy: () => [...queryKeys.psychologist.all, "cancellation-policy"] as const,
    find: (filters?: FindPsychologistFilters) =>
      [...queryKeys.psychologist.all, "find", filters] as const,
    public: (username: string) => [...queryKeys.psychologist.all, "public", username] as const,
    dashboard: () => [...queryKeys.psychologist.all, "dashboard"] as const,
    publicServices: (id: string) => [...queryKeys.psychologist.all, "services", id] as const,
    publicLocations: (id: string) => [...queryKeys.psychologist.all, "locations", id] as const,
  },

  // ============================================
  // PATIENTS - Psychologist's patients (psychologist_patients)
  // ============================================
  patients: {
    all: ["patients"] as const,
    list: (filters?: PatientFilters) =>
      filters
        ? ([...queryKeys.patients.all, "list", filters] as const)
        : ([...queryKeys.patients.all, "list"] as const),
    detail: (id: string) => [...queryKeys.patients.all, "detail", id] as const,
    guardians: (id: string) => [...queryKeys.patients.all, "guardians", id] as const,
    emergencyContacts: (id: string) =>
      [...queryKeys.patients.all, "emergency-contacts", id] as const,
    medicalItems: (id: string) => [...queryKeys.patients.all, "medical-items", id] as const,
    activities: (id: string) => [...queryKeys.patients.all, "activities", id] as const,
    clinicalData: (id: string) => [...queryKeys.patients.all, "clinical-data", id] as const,
    paginated: (params: unknown) => [...queryKeys.patients.all, "paginated", params] as const,
    complete: (id: string) => [...queryKeys.patients.all, "detail", id, "complete"] as const,
  },

  // ============================================
  // SESSIONS - Clinical sessions
  // ============================================
  sessions: {
    all: ["sessions"] as const,
    list: (filters?: SessionFilters) =>
      filters
        ? ([...queryKeys.sessions.all, "list", filters] as const)
        : ([...queryKeys.sessions.all, "list"] as const),
    detail: (id: string) => [...queryKeys.sessions.all, "detail", id] as const,
    upcoming: (limit?: number) =>
      limit
        ? ([...queryKeys.sessions.all, "upcoming", limit] as const)
        : ([...queryKeys.sessions.all, "upcoming"] as const),
    byPatient: (patientId: string) => [...queryKeys.sessions.all, "by-patient", patientId] as const,
    rescheduleRequests: (sessionId: string) =>
      [...queryKeys.sessions.all, "reschedule-requests", sessionId] as const,
    oldestOpen: () => [...queryKeys.sessions.all, "oldest-open"] as const,
    today: () => [...queryKeys.sessions.all, "today"] as const,
  },

  // ============================================
  // NOTES - Clinical notes
  // ============================================
  notes: {
    all: ["notes"] as const,
    list: (filters?: NoteFilters) =>
      filters
        ? ([...queryKeys.notes.all, "list", filters] as const)
        : ([...queryKeys.notes.all, "list"] as const),
    detail: (id: string) => [...queryKeys.notes.all, "detail", id] as const,
    byPatient: (patientId: string) => [...queryKeys.notes.all, "by-patient", patientId] as const,
    bySession: (sessionId: string) => [...queryKeys.notes.all, "by-session", sessionId] as const,
    clinical: (patientId: string) =>
      [...queryKeys.notes.all, "by-patient", patientId, "clinical"] as const,
    progress: (patientId: string) =>
      [...queryKeys.notes.all, "by-patient", patientId, "progress"] as const,
    recent: (limit: number) => [...queryKeys.notes.all, "recent", limit] as const,
    byType: (patientId: string, type: string) =>
      [...queryKeys.notes.all, "by-patient", patientId, type] as const,
  },

  // ============================================
  // FINANCIAL - Financial entries, charges, categories
  // ============================================
  financial: {
    all: ["financial"] as const,
    entries: (filters?: FinancialEntryFilters) =>
      filters
        ? ([...queryKeys.financial.all, "entries", filters] as const)
        : ([...queryKeys.financial.all, "entries"] as const),
    charges: (filters?: ChargeFilters) =>
      filters
        ? ([...queryKeys.financial.all, "charges", filters] as const)
        : ([...queryKeys.financial.all, "charges"] as const),
    chargesPaginated: (pageSize: number, filters?: ChargeFilters) =>
      filters
        ? ([...queryKeys.financial.all, "charges", "paginated", pageSize, filters] as const)
        : ([...queryKeys.financial.all, "charges", "paginated", pageSize] as const),
    categories: () => [...queryKeys.financial.all, "categories"] as const,

    summary: (period: FinancialPeriod) => [...queryKeys.financial.all, "summary", period] as const,
    negotiatedPrice: (patientId: string | undefined, serviceId: string | undefined) =>
      patientId && serviceId
        ? ([...queryKeys.financial.all, "negotiated-price", patientId, serviceId] as const)
        : ([...queryKeys.financial.all, "negotiated-price"] as const),
    patientPending: (patientId: string) =>
      [...queryKeys.financial.all, "charges", "patient", patientId, "pending"] as const,
    recent: (limit: number) => [...queryKeys.financial.all, "recent", limit] as const,
  },

  // ============================================
  // SUBSCRIPTION - User subscription status
  // ============================================
  subscription: ["subscription"] as const,

  // ============================================
  // PRICING - Public pricing plans
  // ============================================
  pricing: {
    all: ["pricing"] as const,
    plans: () => [...queryKeys.pricing.all, "plans"] as const,
  },

  // ============================================
  // PREFERENCES - User preferences
  // ============================================
  preferences: {
    all: ["preferences"] as const,
    user: () => [...queryKeys.preferences.all, "user"] as const,
  },

  messaging: {
    all: ["messaging"] as const,
    preferences: () => [...queryKeys.messaging.all, "preferences"] as const,
  },

  // ============================================
  // DOCUMENTS - Templates and generated documents
  // ============================================
  documents: {
    all: ["documents"] as const,
    templates: () => [...queryKeys.documents.all, "templates"] as const,
    generated: (patientId?: string) =>
      patientId
        ? ([...queryKeys.documents.all, "generated", patientId] as const)
        : ([...queryKeys.documents.all, "generated"] as const),
    detail: (id: string) => [...queryKeys.documents.all, "detail", id] as const,
  },

  // ============================================
  // QUICK NOTES - Psychologist home quick notes
  // ============================================
  quickNotes: {
    all: ["quick-notes"] as const,
    list: () => [...queryKeys.quickNotes.all, "list"] as const,
  },

  // ============================================
  // TESTS - Psychological tests
  // ============================================
  tests: {
    all: ["tests"] as const,
    byPatient: (patientId: string) => [...queryKeys.tests.all, "by-patient", patientId] as const,
    detail: (id: string) => [...queryKeys.tests.all, "detail", id] as const,
  },

  // ============================================
  // GOOGLE CALENDAR - Google Calendar integration
  // ============================================
  googleCalendar: {
    all: ["google-calendar"] as const,
    connection: () => [...queryKeys.googleCalendar.all, "connection"] as const,
    connectionStatus: () => [...queryKeys.googleCalendar.all, "connection-status"] as const,
    syncLogs: (filters?: GoogleSyncLogFilters) =>
      filters
        ? ([...queryKeys.googleCalendar.all, "sync-logs", filters] as const)
        : ([...queryKeys.googleCalendar.all, "sync-logs"] as const),
    syncStatus: () => [...queryKeys.googleCalendar.all, "sync-status"] as const,
    pendingSyncCount: () => [...queryKeys.googleCalendar.all, "pending-sync-count"] as const,
    syncErrorCount: () => [...queryKeys.googleCalendar.all, "sync-error-count"] as const,
    lastSync: () => [...queryKeys.googleCalendar.all, "last-sync"] as const,
  },

  // ============================================
  // CALENDAR EVENTS - Modular calendar system
  // ============================================
  calendarEvents: {
    all: ["calendar-events"] as const,
    list: (filters?: CalendarEventFilters) =>
      filters
        ? ([...queryKeys.calendarEvents.all, "list", filters] as const)
        : ([...queryKeys.calendarEvents.all, "list"] as const),
    detail: (id: string) => [...queryKeys.calendarEvents.all, "detail", id] as const,
    view: (startDate?: string, endDate?: string, eventTypes?: CalendarEventType[]) =>
      [...queryKeys.calendarEvents.all, "view", startDate, endDate, eventTypes] as const,
    byPatient: (patientId: string, filters?: Omit<CalendarEventFilters, "patientId">) =>
      filters
        ? ([...queryKeys.calendarEvents.all, "by-patient", patientId, filters] as const)
        : ([...queryKeys.calendarEvents.all, "by-patient", patientId] as const),
    series: (filters?: CalendarEventSeriesFilters) =>
      filters
        ? ([...queryKeys.calendarEvents.all, "series", filters] as const)
        : ([...queryKeys.calendarEvents.all, "series"] as const),
    seriesDetail: (id: string) => [...queryKeys.calendarEvents.all, "series-detail", id] as const,
    meetLink: (id: string) => [...queryKeys.calendarEvents.all, "detail", id, "meet-link"] as const,
    conflicts: (startDatetime?: string, endDatetime?: string, excludeEventId?: string) =>
      [
        ...queryKeys.calendarEvents.all,
        "conflicts",
        startDatetime,
        endDatetime,
        excludeEventId,
      ] as const,
  },

  // ============================================
  // AVAILABILITY - Weekly rules + exceptions
  // ============================================
  availability: {
    all: ["availability"] as const,
    // New MVP system - recurring weekly config + exceptions
    weeklyConfig: (psychologistId?: string) =>
      psychologistId
        ? ([...queryKeys.availability.all, "weekly-config", psychologistId] as const)
        : ([...queryKeys.availability.all, "weekly-config"] as const),
    exceptions: (psychologistId?: string, fromDate?: string, limit?: number) =>
      [...queryKeys.availability.all, "exceptions", psychologistId, fromDate, limit] as const,
    exceptionDetail: (exceptionId?: string) =>
      exceptionId
        ? ([...queryKeys.availability.all, "exception-detail", exceptionId] as const)
        : ([...queryKeys.availability.all, "exception-detail"] as const),
    // Legacy system (to be deprecated)
    week: (startDate?: string, endDate?: string) =>
      [...queryKeys.availability.all, "week", startDate, endDate] as const,
    sessions: (startDatetime?: string, endDatetime?: string) =>
      [...queryKeys.availability.all, "sessions", startDatetime, endDatetime] as const,
    blocks: (startDatetime?: string, endDatetime?: string) =>
      [...queryKeys.availability.all, "blocks", startDatetime, endDatetime] as const,
    settings: () => [...queryKeys.availability.all, "settings"] as const,
    list: () => [...queryKeys.availability.all, "list"] as const,
    public: (
      psychologistId: string,
      filters: {
        startDate: string;
        endDate: string;
        modality?: "online" | "in_person" | "hybrid";
        locationId?: string;
      },
    ) => [...queryKeys.availability.all, "public", psychologistId, filters] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
