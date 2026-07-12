-- migration-created-via: pnpm supabase:migration:new
-- created-at-utc: 2026-06-05T16:45:49Z

-- Ported from fluri-v0 messaging/privacy preferences.

ALTER TABLE public.psychologist_preferences
  ADD COLUMN IF NOT EXISTS sensitive_data_visible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.psychologist_preferences.sensitive_data_visible
  IS 'Controls whether sensitive data is visible in the UI (privacy mode). Default true.';

UPDATE public.psychologist_preferences
SET sensitive_data_visible = true
WHERE sensitive_data_visible IS NULL;

CREATE TABLE IF NOT EXISTS public.psychologist_message_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES public.user_psychologists(id) ON DELETE CASCADE,
  category text NOT NULL,
  recipient_role text NOT NULL CHECK (recipient_role IN ('patient', 'psychologist', 'assistant')),
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  is_enabled boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (psychologist_id, category, recipient_role, channel)
);

CREATE INDEX IF NOT EXISTS idx_psychologist_message_preferences_lookup
  ON public.psychologist_message_preferences(psychologist_id, category, recipient_role, channel);

ALTER TABLE public.psychologist_message_preferences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'psychologist_message_preferences'
      AND policyname = 'psychologist_message_preferences_select_own'
  ) THEN
    CREATE POLICY psychologist_message_preferences_select_own
      ON public.psychologist_message_preferences
      FOR SELECT
      TO authenticated
      USING (psychologist_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'psychologist_message_preferences'
      AND policyname = 'psychologist_message_preferences_insert_own'
  ) THEN
    CREATE POLICY psychologist_message_preferences_insert_own
      ON public.psychologist_message_preferences
      FOR INSERT
      TO authenticated
      WITH CHECK (psychologist_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'psychologist_message_preferences'
      AND policyname = 'psychologist_message_preferences_update_own'
  ) THEN
    CREATE POLICY psychologist_message_preferences_update_own
      ON public.psychologist_message_preferences
      FOR UPDATE
      TO authenticated
      USING (psychologist_id = auth.uid())
      WITH CHECK (psychologist_id = auth.uid());
  END IF;
END;
$$;
