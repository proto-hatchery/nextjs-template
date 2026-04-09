-- migration-created-via: pnpm supabase:migration:new
-- created-at-utc: 2026-04-08T15:48:54Z

-- Re-anchor calendar/session read views to calendar_events +
-- clinical_session_details and expose a dedicated read-only
-- therapeutic_session_events compatibility view.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_catalog.pg_views
        WHERE schemaname = 'public'
          AND viewname = 'therapeutic_session_events'
    ) THEN
        EXECUTE 'DROP VIEW public.therapeutic_session_events';
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_catalog.pg_views
        WHERE schemaname = 'public'
          AND viewname = 'calendar_events_full'
    ) THEN
        EXECUTE 'DROP VIEW public.calendar_events_full';
    END IF;
END
$$;

CREATE OR REPLACE VIEW public.calendar_events_full
WITH (security_invoker = true) AS
SELECT
    e.id,
    e.psychologist_id,
    e.series_id,
    e.event_type,
    e.title,
    e.description,
    e.location,
    e.color,
    e.start_datetime,
    e.end_datetime,
    e.duration_minutes,
    e.timezone,
    e.all_day,
    e.original_start_datetime,
    e.original_end_datetime,
    e.status,
    e.source,
    e.google_event_id,
    e.google_sync_status,
    e.google_sync_error,
    e.last_synced_at,
    e.metadata,
    e.private_notes,
    e.created_at,
    e.updated_at,
    sd.patient_id AS psychologist_patient_id,
    sd.psychologist_service_id,
    sd.session_number,
    sd.clinical_session_id,
    sd.attendance_confirmed,
    sd.billing_status,
    COALESCE(p.manual_full_name, p.synced_full_name) AS patient_name,
    COALESCE(p.manual_display_name, p.synced_display_name) AS patient_display_name,
    ps.name AS service_name,
    ps.price AS service_price,
    ps.duration_minutes AS service_duration
FROM public.calendar_events e
LEFT JOIN public.clinical_session_details sd ON sd.calendar_event_id = e.id
LEFT JOIN public.psychologist_patients p ON p.id = sd.patient_id
LEFT JOIN public.psychologist_services ps ON ps.id = sd.psychologist_service_id;

COMMENT ON VIEW public.calendar_events_full IS
  'Comprehensive calendar event read model backed by calendar_events and clinical_session_details.';

CREATE OR REPLACE VIEW public.therapeutic_session_events
WITH (security_invoker = true) AS
SELECT
    e.id AS calendar_event_id,
    e.psychologist_id,
    e.series_id,
    e.start_datetime,
    e.end_datetime,
    e.duration_minutes,
    e.timezone,
    e.all_day,
    e.status AS scheduling_status,
    e.source,
    e.title,
    e.description,
    e.location,
    e.color,
    e.google_event_id,
    e.google_sync_status,
    e.google_sync_error,
    e.last_synced_at,
    e.metadata,
    e.private_notes,
    e.created_at,
    e.updated_at,
    sd.id AS session_detail_id,
    sd.clinical_session_id,
    pcs.id AS legacy_session_id,
    sd.patient_id AS psychologist_patient_id,
    sd.psychologist_service_id,
    sd.session_type_id,
    sd.session_number,
    sd.attendance_confirmed,
    sd.confirmation_sent_at,
    sd.reminder_sent_at,
    sd.billing_status,
    sd.billing_attempt_count,
    sd.billing_last_attempt_at,
    sd.billing_last_error,
    sd.billing_next_attempt_at,
    COALESCE(p.manual_full_name, p.synced_full_name) AS patient_name,
    COALESCE(p.manual_display_name, p.synced_display_name) AS patient_display_name,
    ps.name AS service_name,
    ps.price AS service_price,
    ps.duration_minutes AS service_duration
FROM public.calendar_events e
JOIN public.clinical_session_details sd ON sd.calendar_event_id = e.id
LEFT JOIN public.psychologist_clinical_sessions pcs ON pcs.id = sd.clinical_session_id
LEFT JOIN public.psychologist_patients p ON p.id = sd.patient_id
LEFT JOIN public.psychologist_services ps ON ps.id = sd.psychologist_service_id
WHERE e.event_type = 'session';

COMMENT ON VIEW public.therapeutic_session_events IS
  'Read-only therapeutic session event view backed by calendar_events and clinical_session_details.';

GRANT SELECT ON public.calendar_events_full TO authenticated;
GRANT SELECT ON public.calendar_events_full TO anon;
GRANT SELECT ON public.therapeutic_session_events TO authenticated;
GRANT SELECT ON public.therapeutic_session_events TO anon;
