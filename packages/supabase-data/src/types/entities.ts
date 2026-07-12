/**
 * Entity types derived from Database types for use in hooks and components.
 * These types provide a cleaner interface and include computed fields.
 */

import type { Database, Json } from "@workspace/supabase-infra/types/database";
import type {
  AvailabilityExceptionDTO,
  WeeklyAvailabilityConfigDTO,
  WeeklyAvailabilityIntervalDTO,
  WeeklyDayConfigDTO,
} from "../modules/availability/domain/dto/availability.dto";
import type {
  ActivitiesPaginationInputDTO,
  ActivityReferenceDTO,
  AllCatalogsDTO,
  ApproachReferenceDTO,
  CancellationPolicyReferenceDTO,
  ReferenceCategoryDTO,
  ServiceReferenceDTO,
  SpecialtyReferenceDTO,
} from "../modules/catalogs/domain/dto/reference-value.dto";
export type {
  UpdateUserPreferencesInput,
  UserPreferencesDTO,
  UserPreferencesWithMetadataDTO,
} from "../modules/preferences/domain/dto/user-preferences.dto";
export type {
  MessagingCategory,
  MessagingChannel,
  MessagingPreferenceDTO,
  MessagingPreferenceWithMetadataDTO,
  MessagingRecipientRole,
  UpdateMessagingPreferenceInput,
} from "../modules/messaging/domain/dto/messaging-preference.dto";
export type {
  ActivitiesPaginationInputDTO,
  ActivityReferenceDTO,
  AllCatalogsDTO,
  ApproachReferenceDTO,
  CancellationPolicyReferenceDTO,
  ReferenceCategoryDTO,
  ServiceReferenceDTO,
  SpecialtyReferenceDTO,
};
export type { Database, Json };

// ============================================
// Base Types from Database
// ============================================

export type Tables = Database["public"]["Tables"];
export type Enums = Database["public"]["Enums"];

// Table Row types
export type Psychologist = Tables["user_psychologists"]["Row"];
export type PsychologistProfile = Tables["public_profiles"]["Row"];
export type LinktreeLink = Tables["public_linktree_links"]["Row"];
export type PsychologistService = Tables["psychologist_services"]["Row"];
export type PsychologistLocation = Tables["public_locations"]["Row"];
export type PsychologistQuickNote = Tables["psychologist_quick_notes"]["Row"];
export type MarketplacePsychologistProfile = Tables["public_profiles"]["Row"];
export type MarketplaceLocation = Tables["public_locations"]["Row"];
export type MarketplaceLinktreeLink = Tables["public_linktree_links"]["Row"];
export type PsychologistAvailability = Tables["psychologist_weekly_schedules"]["Row"];
export type AvailabilityException = Tables["availability_exceptions"]["Row"];
export type AvailabilityExceptionView = AvailabilityExceptionDTO;
export type PsychologistOnboardingState = Tables["psychologist_onboarding_state"]["Row"];

export type Patient = Tables["psychologist_patients"]["Row"];
export type PsychologistClient = Tables["psychologist_patients"]["Row"];
export type PatientGuardian = Tables["psychologist_patient_guardians"]["Row"];
export type PatientEmergencyContact = Tables["psychologist_patient_emergency_contacts"]["Row"];
export type PatientMedicalItem = Tables["psychologist_patient_medical_items"]["Row"];
export type PatientActivityAssignment = Tables["psychologist_patient_activities"]["Row"];

type SessionEventsRow = Database["public"]["Views"]["therapeutic_session_events"]["Row"];
export type ClinicalSession = Omit<
  SessionEventsRow,
  | "id"
  | "psychologist_id"
  | "start_datetime"
  | "duration_minutes"
  | "scheduling_status"
  | "source"
  | "title"
  | "timezone"
> & {
  id: string;
  psychologist_id: string;
  start_time: string;
  duration_minutes: number;
  status: NonNullable<SessionEventsRow["scheduling_status"]> | "open";
  source: NonNullable<SessionEventsRow["source"]>;
  title: string;
  timezone: string;
};
export type SessionRescheduleRequest = Tables["session_reschedule_requests"]["Row"];
export type SessionRescheduleLog = Tables["session_reschedule_logs"]["Row"];

// Calendar System types (modular)
export type GoogleCalendarConnection = Tables["google_calendar_connections"]["Row"];
export type CalendarEvent = Tables["calendar_events"]["Row"];
export type CalendarEventSeries = Tables["calendar_event_series"]["Row"];
export type CalendarEventSeriesException = Tables["calendar_event_series_exceptions"]["Row"];
export type ClinicalSessionDetails = ClinicalSession;
export type GoogleSyncLog = Tables["google_sync_logs"]["Row"];

export type ClinicalNote = Tables["psychologist_notes"]["Row"];
export type PatientTest = Tables["psychologist_patient_assessments"]["Row"];

export type FinancialEntry = Tables["psychologist_financial_entries"]["Row"];
export type ClientCharge = Tables["psychologist_patient_charges"]["Row"];
export type TransactionCategory = {
  id: string;
  name: string;
  type: string;
  is_selectable: boolean;
};

// Reference types (Reference Values)
export type ReferenceValue = Tables["reference_values"]["Row"];
export type ReferenceCategory = ReferenceCategoryDTO;

export interface ServiceMetadata {
  description?: string;
  default_duration_minutes?: number;
}

export interface CancellationPolicyMetadata {
  fee_percentage?: number;
  min_notice_hours?: number;
}

export type ServiceReference = ServiceReferenceDTO;
export type SpecialtyReference = SpecialtyReferenceDTO;
export type ApproachReference = ApproachReferenceDTO;
export type CancellationPolicyReference = CancellationPolicyReferenceDTO;
export type ActivityReference = ActivityReferenceDTO;
export type ActivitiesPaginationInput = ActivitiesPaginationInputDTO;
export type { UserPreferencesDTO as UserPreferences } from "../modules/preferences/domain/dto/user-preferences.dto";
export type { MessagingPreferenceDTO as MessagingPreference } from "../modules/messaging/domain/dto/messaging-preference.dto";

export type PsychologistServiceWithReference = {
  id: string;
  psychologist_id: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  description: string | null;
  is_active: boolean;
  is_public: boolean | null;
  notes?: string | null;
  catalog_id: string | null;
  service_id: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  reference: Pick<
    ServiceReference,
    "id" | "name" | "code" | "description" | "default_duration_minutes"
  > | null;
};

export interface ProfileLink {
  type: string;
  url: string;
  label?: string;
}

export interface PublicPsychologistSpecialty {
  id: string;
  name: string;
}

export interface PublicPsychologistApproach {
  id: string;
  name: string;
}

export interface PublicPsychologist extends Psychologist {
  bio: string | null;
  links: ProfileLink[];
  specialties: PublicPsychologistSpecialty[];
  therapeutic_approaches: PublicPsychologistApproach[];
  services: PsychologistService[];
  locations: PsychologistLocation[];
  linktree_links: LinktreeLink[];
  linktree_display_name: string | null;
  linktree_avatar_url: string | null;
  linktree_background_url: string | null;
  linktree_slug: string | null;
  linktree_theme: string | null;
  linktree_avatar_path: string | null;
  linktree_background_path: string | null;
  social_links: Json | null;
  registered_specialties: string[];
}

export interface LinktreeData {
  display_name: string | null;
  avatar_url: string | null;
  background_url: string | null;
  slug: string | null;
  social_links: Json | null;
  linktree_theme: string | null;
  avatar_path: string | null;
  background_path: string | null;
  full_name: string | null;
  bio: string | null;
  linktree_links: LinktreeLink[];
}

export interface FindPsychologistFilters {
  search?: string;
  specialty?: string;
  modality?: "online" | "in_person" | "hybrid";
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating_desc" | "name_asc";
  page?: number;
  pageSize?: number;
}

export interface ComputedPsychologist {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  specialties: string[];
  modalities: string[];
  lowestPrice: number;
  locations: PsychologistLocation[];
  bio: string | null;
  professionalTitle?: string;
  crp?: string;
  rating: number;
  reviewCount: number;
  videoUrl?: string;
}

// ============================================
// Enum types (AppRole is exported from ./app-role to avoid duplicate export in package index)
// ============================================
export type ClinicalSessionStatus = Enums["calendar_event_status"] | "open";
export type ClinicalNoteType = Enums["clinical_note_type"];
export type PracticeModality = Enums["practice_modality"];
export type PaymentStatus = Enums["payment_status_type"];
export type PaymentMethod = Enums["payment_method_type"];
export type RiskLevelType = Enums["risk_level_type"];
export type FinancialEntryStatus = Enums["financial_entry_status"];
export type RescheduleInitiator = Enums["reschedule_initiator"];
export type RescheduleRequestStatus = Enums["reschedule_request_status"];

// Calendar System enums (modular)
export type CalendarEventType = Enums["calendar_event_type"];
export type CalendarEventStatus = Enums["calendar_event_status"];
export type CalendarEventSource = Enums["calendar_event_source"];
export type SupervisionType = Enums["supervision_type"];
export type BlockType = Enums["block_type"];
export type DeliveryMode = Enums["delivery_mode"];
export type GoogleSyncStatus = Enums["google_sync_status"];
export type SeriesExceptionType = Enums["series_exception_type"];
export type SyncDirection = Enums["sync_direction"];
export type SyncOperation = Enums["sync_operation"];
export type SyncResultStatus = Enums["sync_result_status"];

// ============================================
// Filter Types
// ============================================

export interface PatientFilters {
  status?: "active" | "inactive" | "on_break" | "discharged" | "archived" | string[];
  search?: string;
  isMinor?: boolean;
  dateFrom?: string;
  dateTo?: string;
  patientIds?: string[];
  limit?: number;
  offset?: number;
}

export interface PatientSort {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginatedPatientsResponse {
  data: PatientWithDetails[];
  totalCount: number;
  nextCursor?: string;
  hasMore: boolean;
  currentPage?: number;
  pageSize?: number;
}

export interface SessionFilters {
  status?: ClinicalSessionStatus;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface NoteFilters {
  noteType?: ClinicalNoteType;
  patientId?: string;
  sessionId?: string;
  isArchived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FinancialEntryFilters {
  type?: "income" | "expense";
  categoryId?: string;
  status?: FinancialEntryStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ChargeFilters {
  paymentStatus?: PaymentStatus | PaymentStatus[];
  patientId?: string;
  patientIds?: string[];
  startDate?: string;
  endDate?: string;
  paymentMethods?: PaymentMethod[];
  limit?: number;
  offset?: number;
}

export interface ChargeQueryParams {
  cursor?: string;
  pageSize?: number;
  filters?: ChargeFilters;
}

// Calendar Event Filters (modular system)
export interface CalendarEventFilters {
  eventType?: CalendarEventType | CalendarEventType[];
  status?: CalendarEventStatus | CalendarEventStatus[];
  source?: CalendarEventSource;
  patientId?: string;
  seriesId?: string;
  startDate?: string;
  endDate?: string;
  syncStatus?: GoogleSyncStatus;
  isRecurring?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CalendarEventSeriesFilters {
  eventType?: CalendarEventType | CalendarEventType[];
  patientId?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface GoogleSyncLogFilters {
  direction?: SyncDirection;
  operation?: SyncOperation;
  status?: SyncResultStatus;
  eventId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedChargesResponse {
  data: ChargeWithRelations[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface FinancialPeriod {
  startDate: string;
  endDate: string;
}

// ============================================
// Enriched Types (with computed fields)
// ============================================

export interface PatientWithDetails extends PsychologistClient {
  /** Display name (synced or manual) */
  displayName: string;
  /** Avatar URL from linked patients profile */
  avatarUrl?: string | null;
  /** Email (synced or manual) */
  email: string | null;
  /** Phone (synced or manual) */
  phone: string | null;
  /** Calculated age from date of birth */
  age: number | null;
  /** Date of birth (synced or manual) */
  dateOfBirth: string | null;
  /** Gender (synced or manual) */
  gender: string | null;
  first_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  cpf?: string | null;
  patient_origin?: string | null;
  address?: Json | null;
  emergency_contacts?: Json | null;
  notifications_whatsapp_session_reminders?: boolean | null;
  is_synced?: boolean | null;
  last_synced?: string | null;
}

export interface SessionWithDetails extends ClinicalSession {
  /** Patient display name */
  patientName: string;
  /** Service name (from snapshot or service) */
  serviceName: string | null;
  /** Price in cents (from session snapshot) */
  price: number | null;
  /** Location name */
  locationName: string | null;
  /** Whether session is in the past */
  isPast: boolean;
  /** Whether session is today */
  isToday: boolean;
  /** Linked charge info if already materialized */
  charge?: {
    id: string;
    price_cents: number | null;
    payment_status: PaymentStatus | null;
    due_date: string | null;
  } | null;
  location_id?: string | null;
  snapshot_price_cents?: number | null;
  snapshot_service_name?: string | null;
  notes?: string | null;
}

export interface NoteWithDetails extends ClinicalNote {
  /** Patient display name */
  patientName: string | null;
  /** Session date if linked */
  sessionDate: string | null;
}

// ============================================
// Calendar System Enriched Types (Modular)
// ============================================

export interface GoogleCalendarConnectionWithStatus extends GoogleCalendarConnection {
  /** Whether the watch channel is active */
  isWatchActive: boolean;
  /** Time until watch expires */
  watchExpiresIn: number | null;
  /** Human-readable connection status */
  connectionStatus: "connected" | "disconnected" | "expired" | "error";
}

export type CalendarHoliday = Database["public"]["Tables"]["calendar_holidays"]["Row"];

export type CalendarHolidayFilters = {
  year?: number;
  state?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
};

// Type-specific metadata interfaces
export interface SessionMetadata {
  patient_id?: string;
  session_type_id?: string;
  session_number?: number;
  service_id?: string;
  location_id?: string;
  price?: number;
  google_meet_link?: string;
}

export interface SupervisionMetadata {
  supervision_type: SupervisionType;
  supervisor_name?: string;
  supervisee_name?: string;
  topic?: string;
  google_meet_link?: string;
}

export interface MeetingMetadata {
  participants?: string[];
  meeting_link?: string;
  meeting_type?: string;
}

export interface TaskMetadata {
  priority?: "low" | "medium" | "high";
  completed_at?: string;
  checklist?: Array<{ item: string; done: boolean }>;
}

export interface BlockMetadata {
  block_type: BlockType;
  reason?: string;
}

export interface OtherEventMetadata {
  category?: string;
  google_meet_link?: string;
  [key: string]: unknown;
}

export type CalendarEventMetadata =
  | SessionMetadata
  | SupervisionMetadata
  | MeetingMetadata
  | TaskMetadata
  | BlockMetadata
  | OtherEventMetadata;

export interface CalendarEventWithDetails extends CalendarEvent {
  /** Whether this is part of a recurring series */
  isRecurring: boolean;
  /** Whether this event was modified from the series template */
  isModified: boolean;
  /** Whether this event was rescheduled */
  wasRescheduled: boolean;
  /** Series recurrence rule (if recurring) */
  recurrenceRule: string | null;
  /** For sessions: patient display name */
  patientName: string | null;
  /** For sessions: service name */
  serviceName: string | null;
  /** For sessions: session type name */
  sessionTypeName: string | null;
  /** Location name */
  locationName: string | null;
  /** Linked charge info if available (for sessions) */
  charge?: {
    id: string;
    payment_status: PaymentStatus | null;
    due_date: string | null;
  } | null;
  /** Typed metadata based on event_type */
  typedMetadata: CalendarEventMetadata;
}

export interface CalendarEventSeriesWithDetails extends CalendarEventSeries {
  /** For sessions: patient display name */
  patientName: string | null;
  /** Service name */
  serviceName: string | null;
  /** Number of events generated */
  eventCount: number;
  /** Next upcoming event */
  nextEvent: CalendarEvent | null;
  /** Number of exceptions (cancelled/rescheduled) */
  exceptionCount: number;
}

/** Unified calendar view item (for calendar UI) */
export interface CalendarViewEvent {
  id: string;
  seriesId: string | null;
  psychologistId: string;
  eventType: CalendarEventType;
  title: string;
  description: string | null;
  startDatetime: string;
  endDatetime: string;
  timezone: string;
  allDay: boolean;
  status: CalendarEventStatus;
  source: CalendarEventSource;
  color: string | null;
  location: string | null;
  googleEventId: string | null;
  googleSyncStatus: GoogleSyncStatus;
  isRecurring: boolean;
  wasRescheduled: boolean;
  // Session-specific (null for other types)
  patientId: string | null;
  patientName: string | null;
  sessionTypeName: string | null;
  // Supervision-specific
  supervisionType: SupervisionType | null;
  // Block-specific
  blockType: BlockType | null;
}

export interface GoogleSyncLogWithDetails extends GoogleSyncLog {
  /** Event title */
  eventTitle: string | null;
  /** Event start time */
  eventStartTime: string | null;
}

export interface FinancialEntryWithDetails extends FinancialEntry {
  /** Category name */
  categoryName: string | null;
  /** Category color */
  categoryColor: string | null;
  /** Patient name - deprecated, always null. Financial entries focus on psychologist's financial health. */
  patientName: null;
}

export interface ChargeWithDetails extends ClientCharge {
  /** Patient display name */
  patientName: string;
  /** Session date if linked */
  sessionDate: string | null;
  /** Service name if linked */
  serviceName: string | null;
}

/**
 * Charge with nested relations (for compatibility with legacy code).
 * Use ChargeWithDetails for new code.
 */
export type ChargeWithRelations = ClientCharge & {
  patient?: {
    id: string;
    patient_id: string | null;
    display_name?: string | null;
    preferred_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    full_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
  session?: {
    id: string;
    start_time: string;
    service?: {
      name?: string | null;
      catalog?: {
        name: string | null;
      } | null;
    } | null;
  } | null;
};

// ============================================
// Reference Types (simplified for UI)
// ============================================

export type ReferencesData = Pick<AllCatalogsDTO, "services" | "specialties" | "approaches">;
export type AllReferencesData = Pick<
  AllCatalogsDTO,
  "services" | "specialties" | "approaches" | "cancellationPolicies"
>;

// ============================================
// Input Types for Mutations
// ============================================

export interface UpdatePsychologistProfileInput {
  fullName?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  cpf?: string;
  rg?: string;
  avatarUrl?: string;
  businessType?: string;
  cnpj?: string;
  companyName?: string;
  timezone?: string;
}

export interface LinktreeSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  period?: string;
  startYear?: string;
  endYear?: string;
  type: "academic" | "professional";
}

export interface UpdateLinktreeProfileInput {
  displayName?: string;
  tagline?: string | null;
  bio?: string;
  avatarUrl?: string | null;
  avatarPath?: string | null;
  backgroundUrl?: string | null;
  backgroundPath?: string | null;
  linktreeTheme?: string | null;
  usernameSlug?: string | null;
  socialLinks?: LinktreeSocialLinks | null;
  isPublic?: boolean;
  showInMarketplace?: boolean;
  acceptingNewPatients?: boolean;
  specialties?: string[];
  therapeuticApproaches?: string[];
  academicTimeline?: TimelineItem[];
  professionalTimeline?: TimelineItem[];
}

export interface LinktreeLinkInput {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpsertLinktreeLinksInput {
  links: LinktreeLinkInput[];
}

export interface UpdatePsychologistCredentialsInput {
  crp: string;
  crpState: string;
}

export interface SaveOnboardingStepInput {
  step: number;
  data: Record<string, unknown>;
}

export interface OnboardingDraftData {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  birthDate?: string;
  cpf?: string;
  phone?: string;
  crp?: string;
  crpState?: string;
  serviceId?: string;
  serviceName?: string;
  durationMinutes?: number;
  price?: number;
  specialties?: { id: string; name: string }[];
  approaches?: { id: string; name: string }[];
  monthlyVolume?: "0-10" | "10-30" | "30-50" | "50+";
}

// Alias for compatibility with existing code
export type OnboardingSummary = OnboardingDraftData;

export interface UpsertServiceInput {
  id?: string;
  serviceId: string;
  price: number;
  durationMinutes: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpsertLocationInput {
  id?: string;
  name: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
}

// ============================================
// Availability Input Types
// ============================================

export interface CreateAvailabilityInput {
  dayOfWeek: number; // 0..6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  locationId?: string;
  deliveryMode: "in_person" | "telehealth" | "hybrid";
  isActive?: boolean;
  effectiveStart?: string;
  effectiveEnd?: string;
}

export type UpdateAvailabilityInput = Partial<CreateAvailabilityInput>;

export interface CreateAvailabilityExceptionInput {
  exceptionDate: string; // YYYY-MM-DD
  isAvailable: boolean;
  reason?: string;
  startTime?: string;
  endTime?: string;
}

export type WeeklyAvailabilityInterval = WeeklyAvailabilityIntervalDTO;
export type WeeklyDayConfig = WeeklyDayConfigDTO;
export type WeeklyAvailabilityConfig = WeeklyAvailabilityConfigDTO;

export interface CreatePatientInput {
  first_name: string;
  last_name?: string;
  preferred_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  defaultSessionPrice?: number;
  gender?: string;
  preferred_contact_method?: string;
  notifications_whatsapp_session_reminders?: boolean;
  patient_origin?: string;
}

export interface UpdatePatientInput {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  attachedDocuments?: Record<string, unknown>;
  clinicalNotes?: string;
  defaultSessionPrice?: number;
  preferredContactMethod?: string;
  notificationsWhatsappSessionReminders?: boolean;
  patientOrigin?: string;
  gender?: string;
}

export interface CreateSessionInput {
  patientId: string;
  startTime: string;
  durationMinutes?: number;
  serviceId?: string;
  locationId?: string;
  notes?: string;
  recurrenceRule?: string;
  timezone?: string;
  customPriceCents?: number;
  status?: "scheduled" | "open" | "completed" | "cancelled" | "no_show";
  paymentStatus?: "pending" | "paid";
}

export interface UpdateSessionInput {
  startTime?: string;
  durationMinutes?: number;
  serviceId?: string;
  locationId?: string | null;
  notes?: string;
  recurrenceRule?: string;
  timezone?: string;
  customPriceCents?: number;
}

export interface CreateNoteInput {
  patientId?: string;
  sessionId?: string;
  title?: string;
  noteType?: ClinicalNoteType;
  encodedContent: string;
  tags?: string[];
  relatedEvolutionId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  noteType?: ClinicalNoteType;
  encodedContent?: string;
  tags?: string[];
  relatedEvolutionId?: string;
}

export type QuickNotePriority = "none" | "low" | "medium" | "high";
export type {
  ClearCompletedResult,
  CreateQuickNoteInput,
  GroupedQuickNotesDTO,
  QuickNoteDTO,
  QuickNoteResult,
  UpdateQuickNoteInput,
} from "../modules/quick-notes/domain/dto/quick-note.dto";
export type {
  QuickNoteDTO as PsychologistQuickNoteDTO,
  QuickNotePriority as QuickNotePriorityDTO,
} from "../modules/quick-notes/domain/dto/quick-note.dto";
export {
  DEFAULT_QUICK_NOTE_PRIORITY,
  groupQuickNotes,
  isQuickNotePriority,
  sortQuickNotes,
} from "../modules/quick-notes/domain/dto/quick-note.dto";

export interface CreateFinancialEntryInput {
  type: "income" | "expense";
  amount: number;
  description?: string;
  dateTime?: string;
  categoryId?: string;
  sessionId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateFinancialEntryInput {
  amount?: number;
  description?: string;
  dateTime?: string;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  status?: FinancialEntryStatus;
  notes?: string;
}

export interface CreateChargeInput {
  patientId: string;
  priceCents: number; // Price in cents (e.g., 15000 = R$150.00)
  description?: string;
  sessionId?: string;
  serviceId?: string;
  dueDate?: string;
  paymentStatus?: PaymentStatus; // "pending" | "paid"
}

export interface MarkChargePaidInput {
  paymentMethod: PaymentMethod;
  paidAt?: string;
  paymentNotes?: string;
}

export interface CreateGuardianInput {
  patientId: string;
  fullName: string;
  guardianType: "legal_guardian" | "parent" | "tutor" | "caregiver" | "other";
  relationship?: string;
  email?: string;
  phone?: string;
  cpf?: string;
}

export interface UpdateGuardianInput {
  fullName?: string;
  guardianType?: "legal_guardian" | "parent" | "tutor" | "caregiver" | "other";
  relationship?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status?: "active" | "inactive";
}

// ============================================
// Google Calendar & Recurrence Input Types
// ============================================

export interface ConnectGoogleCalendarInput {
  code: string;
  redirectUri: string;
}

export interface UpdateGoogleCalendarConnectionInput {
  googleCalendarId?: string;
  syncEnabled?: boolean;
  syncToGoogle?: boolean;
  syncFromGoogle?: boolean;
  // What event types to sync
  syncSessions?: boolean;
  syncSupervisions?: boolean;
  syncMeetings?: boolean;
  syncTasks?: boolean;
  syncBlocks?: boolean;
  syncOther?: boolean;
  // Privacy settings
  showPatientName?: boolean;
  showEventDetails?: boolean;
}

// ============================================
// Calendar Event Input Types (Modular)
// ============================================

/** Options for editing a series */
export type SeriesEditScope = "this" | "this_and_following" | "all";

/** Base input for creating any calendar event */
export interface CreateCalendarEventInput {
  eventType: CalendarEventType;
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startDatetime: string;
  endDatetime?: string;
  durationMinutes?: number;
  timezone?: string;
  allDay?: boolean;
  status?: CalendarEventStatus;
  privateNotes?: string;
  metadata?: Record<string, unknown>;
}

/** Input for creating a session event (extends base) */
export interface CreateSessionEventInput extends Omit<
  CreateCalendarEventInput,
  "eventType" | "metadata"
> {
  patientId: string;
  sessionTypeId?: string;
  sessionNumber?: number;
  serviceId?: string;
  locationId?: string;
  price?: number;
  notes?: string;
  createGoogleMeet?: boolean;
  recurrenceRule?: string;
}

/** Input for creating a supervision event */
export interface CreateSupervisionEventInput extends Omit<
  CreateCalendarEventInput,
  "eventType" | "metadata"
> {
  supervisionType: SupervisionType;
  supervisorName?: string;
  superviseeName?: string;
  topic?: string;
  createGoogleMeet?: boolean;
  recurrenceRule?: string;
}

/** Input for creating a block event */
export interface CreateBlockEventInput extends Omit<
  CreateCalendarEventInput,
  "eventType" | "metadata"
> {
  blockType?: BlockType;
  reason?: string;
}

/** Input for creating an event series */
export interface CreateCalendarEventSeriesInput {
  eventType: CalendarEventType;
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startTime: string; // HH:MM:SS format
  endTime: string; // HH:MM:SS format
  durationMinutes?: number;
  timezone?: string;
  allDay?: boolean;
  rrule: string; // RFC 5545 RRULE
  effectiveStart: string; // Date string YYYY-MM-DD
  effectiveEnd?: string; // Date string YYYY-MM-DD
  metadata?: Record<string, unknown>;
}

/** Input for creating a recurring session series */
export interface CreateSessionSeriesInput extends Omit<
  CreateCalendarEventSeriesInput,
  "eventType" | "metadata"
> {
  patientId: string;
  sessionTypeId?: string;
  serviceId?: string;
  locationId?: string;
  price?: number;
  sessionNumber?: number;
}

export interface ConvertSingleEventToSeriesInput extends Omit<
  CreateCalendarEventSeriesInput,
  "eventType"
> {
  eventId: string;
  eventType: Exclude<CalendarEventType, "session">;
  startDatetime: string;
  endDatetime: string;
}

export interface ConvertSingleSessionEventToSeriesInput {
  eventId: string;
  eventType: "session";
  title: string;
  description?: string;
  location?: string;
  color?: string;
  startTime: string;
  endTime: string;
  startDatetime: string;
  endDatetime: string;
  durationMinutes?: number;
  timezone?: string;
  rrule: string;
  effectiveStart: string;
  effectiveEnd?: string;
  patientId: string;
  sessionTypeId?: string;
  serviceId?: string;
  locationId?: string;
  price?: number;
  sessionNumber?: number;
  metadata?: Record<string, unknown>;
}

export type ConvertCalendarEventToSeriesInput =
  | ConvertSingleEventToSeriesInput
  | ConvertSingleSessionEventToSeriesInput;

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  location?: string;
  color?: string;
  startDatetime?: string;
  endDatetime?: string;
  durationMinutes?: number;
  allDay?: boolean;
  status?: CalendarEventStatus;
  privateNotes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCalendarEventSeriesInput {
  title?: string;
  description?: string;
  location?: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  allDay?: boolean;
  timezone?: string;
  rrule?: string;
  effectiveEnd?: string;
  metadata?: Record<string, unknown>;
}

export interface RescheduleCalendarEventInput {
  eventId: string;
  newStartDatetime: string;
  newEndDatetime?: string;
  reason?: string;
}

export interface CancelCalendarEventInput {
  eventId: string;
  reason?: string;
  /** If part of a series, scope of cancellation */
  scope?: SeriesEditScope;
}

export interface SyncEventToGoogleInput {
  eventId: string;
  force?: boolean;
}

export interface GoogleCalendarEventInput {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  recurrence?: string[];
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: "hangoutsMeet";
      };
    };
  };
}

// ============================================
// Result Types for Mutations
// ============================================

export interface MutationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PatientResult {
  id: string;
  displayName: string;
}

export interface SessionResult {
  id: string;
  status?: "scheduled" | "open";
}

export interface NoteResult {
  id: string;
}

export interface FinancialEntryResult {
  id: string;
}

export interface ChargeResult {
  id: string;
}

export interface GoogleCalendarConnectionResult {
  id: string;
  googleEmail: string;
}

export interface CalendarEventSeriesResult {
  id: string;
  eventsCreated: number;
}

export interface CalendarEventResult {
  id: string;
  googleEventId?: string;
}

export interface GoogleSyncResult {
  success: boolean;
  googleEventId?: string;
  error?: string;
}

// ============================================
// Financial Summary Types
// ============================================

export interface FinancialSummary {
  period: FinancialPeriod;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeByCategory: CategorySummary[];
  expensesByCategory: CategorySummary[];
  pendingCharges: number;
  overdueCharges: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  total: number;
  count: number;
}

// ============================================
// Clinical Data Types
// ============================================

export type ClinicalDataSource = "client_portal" | "therapist";

export interface PatientClinicalCondition {
  id: string;
  name: string;
  conditionType?: string | null;
  diagnosedDate?: string | null;
  icd10Code?: string | null;
  status?: string | null;
  notes?: string | null;
  source: ClinicalDataSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PatientClinicalMedication {
  id: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean | null;
  prescribedBy?: string | null;
  reason?: string | null;
  notes?: string | null;
  source: ClinicalDataSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PatientClinicalData {
  patientId: string;
  psychologistId: string;
  hasLinkedClientAccount: boolean;
  initialComplaint: string | null;
  conditions: PatientClinicalCondition[];
  medications: PatientClinicalMedication[];
}

export interface ActivityAssignmentWithActivity extends PatientActivityAssignment {
  activity?: {
    name: string;
  } | null;
  responses_count: number;
}

export type GeneratedDocument = Tables["generated_documents"]["Row"];

export interface GeneratedDocumentWithTemplate extends GeneratedDocument {
  template?: {
    title: string;
  } | null;
}

export interface GeneratedDocumentWithTemplateAndPatient extends GeneratedDocumentWithTemplate {
  patient?: {
    id: string;
    display_name: string | null;
    first_name: string | null;
    full_name: string | null;
    last_name: string | null;
    preferred_name: string | null;
  } | null;
}

export type GuardianDocument = Tables["psychologist_patient_guardian_documents"]["Row"];

// ---------------------------------------------------------------------------
// Net Availability Engine Types
// ---------------------------------------------------------------------------

export interface AvailabilitySlot {
  slot_start: string;
  slot_end: string;
  duration_minutes: number;
  day_of_week: number;
  delivery_mode: DeliveryMode;
}

export interface BusySlotRecord {
  id: string;
  psychologist_id: string;
  slot_range: string;
  source_type: "calendar_event" | "clinical_session" | "series_expansion";
  source_id: string;
  event_type: CalendarEventType | null;
  is_hard_block: boolean;
  title: string | null;
  created_at: string;
}

export interface BookAppointmentRequest {
  p_psychologist_id: string;
  p_patient_client_id: string;
  p_start_time: string;
  p_duration_minutes?: number;
  p_service_id?: string | null;
  p_location_id?: string | null;
  p_timezone?: string;
  p_title?: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  error?: "SLOT_IN_PAST" | "INVALID_DURATION" | "SLOT_CONFLICT" | "DOUBLE_BOOKING_PREVENTED";
  message?: string;
  data?: {
    event_id: string;
    session_id: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  };
}

export interface GetNetAvailabilityRequest {
  p_psychologist_id: string;
  p_start_date: string;
  p_end_date: string;
  p_slot_duration_minutes?: number;
  p_timezone?: string;
}

export interface CheckSlotAvailableRequest {
  p_psychologist_id: string;
  p_start_time: string;
  p_end_time: string;
}

export interface RebuildBusySlotsRequest {
  psychologist_id: string;
  months_ahead?: number;
  full_rebuild?: boolean;
}

export interface RebuildBusySlotsResponse {
  success: boolean;
  data?: {
    psychologist_id: string;
    slots_created: number;
    series_processed: number;
    months_ahead: number;
    full_rebuild: boolean;
  };
  errors?: string[];
}

// ============================================
// Onboarding Draft Types
// ============================================

export interface OnboardingDraftLink {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface OnboardingSocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

export interface OnboardingTimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface OnboardingPhase7DraftData {
  slug?: string;
  displayName?: string;
  tagline?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPath?: string;
  backgroundUrl?: string;
  backgroundPath?: string;
  linktreeTheme?: string;
  socials?: OnboardingSocialLinks;
  links?: OnboardingDraftLink[];
  specialties?: string[];
  therapeuticApproaches?: string[];
  academicTimeline?: OnboardingTimelineItem[];
  professionalTimeline?: OnboardingTimelineItem[];
  showInMarketplace?: boolean;
}

export interface OnboardingDraftData {
  phase7?: OnboardingPhase7DraftData;
}

// ============================================
// Server Action Result Types
// ============================================

export type AppErrorType =
  | { type: "Validation"; code: string; message: string; details?: Record<string, unknown> }
  | { type: "Auth"; code: string; message: string; details?: Record<string, unknown> }
  | { type: "NotFound"; code: string; message: string; resourceType?: string; resourceId?: string }
  | { type: "Conflict"; code: string; message: string; details?: Record<string, unknown> }
  | {
      type: "Infra";
      code: string;
      message: string;
      cause?: unknown;
      details?: Record<string, unknown>;
    };

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppErrorType };
