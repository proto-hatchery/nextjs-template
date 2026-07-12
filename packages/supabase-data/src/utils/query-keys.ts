export const queryKeys = {
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
  psychologist: {
    all: ["psychologist"] as const,
    profile: (id?: string) =>
      id
        ? ([...queryKeys.psychologist.all, "profile", id] as const)
        : ([...queryKeys.psychologist.all, "profile"] as const),
    onboarding: () => [...queryKeys.psychologist.all, "onboarding"] as const,
    services: () => [...queryKeys.psychologist.all, "services"] as const,
    locations: () => [...queryKeys.psychologist.all, "locations"] as const,
    extendedProfile: () => [...queryKeys.psychologist.all, "extended-profile"] as const,
    linktreeLinks: () => [...queryKeys.psychologist.all, "linktree-links"] as const,
    linktree: (slug: string) => [...queryKeys.psychologist.all, "linktree", slug] as const,
    public: (username: string) => [...queryKeys.psychologist.all, "public", username] as const,
    publicServices: (id: string) => [...queryKeys.psychologist.all, "services", id] as const,
    publicLocations: (id: string) => [...queryKeys.psychologist.all, "locations", id] as const,
    find: (filters?: unknown) => [...queryKeys.psychologist.all, "find", filters] as const,
    dashboard: () => [...queryKeys.psychologist.all, "dashboard"] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (filters?: unknown) =>
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
  sessions: {
    all: ["sessions"] as const,
    list: (filters?: unknown) =>
      filters
        ? ([...queryKeys.sessions.all, "list", filters] as const)
        : ([...queryKeys.sessions.all, "list"] as const),
    detail: (id: string) => [...queryKeys.sessions.all, "detail", id] as const,
    upcoming: (limit?: number) =>
      limit
        ? ([...queryKeys.sessions.all, "upcoming", limit] as const)
        : ([...queryKeys.sessions.all, "upcoming"] as const),
    byPatient: (patientId: string) => [...queryKeys.sessions.all, "by-patient", patientId] as const,
    today: () => [...queryKeys.sessions.all, "today"] as const,
  },
  notes: {
    all: ["notes"] as const,
    list: (filters?: unknown) =>
      filters
        ? ([...queryKeys.notes.all, "list", filters] as const)
        : ([...queryKeys.notes.all, "list"] as const),
    detail: (id: string) => [...queryKeys.notes.all, "detail", id] as const,
    byPatient: (patientId: string) => [...queryKeys.notes.all, "by-patient", patientId] as const,
    bySession: (sessionId: string) => [...queryKeys.notes.all, "by-session", sessionId] as const,
    clinical: (patientId: string) => [...queryKeys.notes.all, "clinical", patientId] as const,
    progress: (patientId: string) => [...queryKeys.notes.all, "progress", patientId] as const,
    recent: (limit: number) => [...queryKeys.notes.all, "recent", limit] as const,
    byType: (patientId: string, noteType: string) =>
      [...queryKeys.notes.all, "by-type", patientId, noteType] as const,
  },
  financial: {
    all: ["financial"] as const,
    entries: (filters?: unknown) =>
      filters
        ? ([...queryKeys.financial.all, "entries", filters] as const)
        : ([...queryKeys.financial.all, "entries"] as const),
    charges: (filters?: unknown) =>
      filters
        ? ([...queryKeys.financial.all, "charges", filters] as const)
        : ([...queryKeys.financial.all, "charges"] as const),
    chargesPaginated: (pageSize: number, filters?: unknown) =>
      [...queryKeys.financial.all, "charges", "paginated", pageSize, filters] as const,
    categories: () => [...queryKeys.financial.all, "categories"] as const,
    summary: (period: unknown) => [...queryKeys.financial.all, "summary", period] as const,
    recent: (limit: number) => [...queryKeys.financial.all, "recent", limit] as const,
    negotiatedPrice: (patientId: string | undefined, serviceId: string | undefined) =>
      patientId && serviceId
        ? ([...queryKeys.financial.all, "negotiated-price", patientId, serviceId] as const)
        : ([...queryKeys.financial.all, "negotiated-price"] as const),
  },
  documents: {
    all: ["documents"] as const,
    templates: () => [...queryKeys.documents.all, "templates"] as const,
    generated: (patientId?: string) =>
      patientId
        ? ([...queryKeys.documents.all, "generated", patientId] as const)
        : ([...queryKeys.documents.all, "generated"] as const),
    detail: (documentId: string) => [...queryKeys.documents.all, "detail", documentId] as const,
  },
  quickNotes: {
    all: ["quick-notes"] as const,
    list: () => [...queryKeys.quickNotes.all, "list"] as const,
  },
  availability: {
    all: ["availability"] as const,
    weeklyConfig: () => [...queryKeys.availability.all, "weekly-config"] as const,
  },
  tests: {
    all: ["tests"] as const,
    byPatient: (patientId: string) => [...queryKeys.tests.all, "by-patient", patientId] as const,
  },
  publicProfile: {
    all: ["public-profile"] as const,
    profile: () => [...queryKeys.publicProfile.all, "profile"] as const,
    linktreeLinks: () => [...queryKeys.publicProfile.all, "linktree-links"] as const,
    siteSettings: () => [...queryKeys.publicProfile.all, "site-settings"] as const,
  },
};
