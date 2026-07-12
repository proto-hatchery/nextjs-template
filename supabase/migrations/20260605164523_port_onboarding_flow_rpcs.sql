-- migration-created-via: pnpm supabase:migration:new
-- created-at-utc: 2026-06-05T16:45:49Z

-- Port onboarding flow RPCs (fluri-v0 20260310140450 + column adds)

ALTER TABLE public.psychologist_onboarding_state
ADD COLUMN IF NOT EXISTS current_step_id text DEFAULT 'identity',
ADD COLUMN IF NOT EXISTS completed_steps jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS step_drafts jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.psychologist_onboarding_state.current_step_id IS 'Current active step in the onboarding flow (e.g., identity, professional, services, etc.)';
COMMENT ON COLUMN public.psychologist_onboarding_state.completed_steps IS 'Array of completed step IDs as JSONB for atomic step tracking';
COMMENT ON COLUMN public.psychologist_onboarding_state.step_drafts IS 'Per-step draft data keyed by step_id';

CREATE INDEX IF NOT EXISTS idx_onboarding_state_step_id
ON public.psychologist_onboarding_state(current_step_id);

-- =============================================================================
-- PART 0: Drop dependent triggers, view, and functions so signatures can change
-- =============================================================================

DROP TRIGGER IF EXISTS trg_sync_payment_step ON public.user_psychologists;
DROP TRIGGER IF EXISTS trg_sync_onboarding_completed ON public.user_psychologists;

DROP VIEW IF EXISTS public.psychologist_onboarding_summary;

DROP FUNCTION IF EXISTS public.get_current_onboarding_step(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_onboarding_step(uuid, text, boolean, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.update_onboarding_step(uuid, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding_step(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.sync_payment_step_with_subscription() CASCADE;
DROP FUNCTION IF EXISTS public.sync_onboarding_completed_with_essential() CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding_phase(uuid, integer, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_onboarding_status_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_onboarding_status_v2() CASCADE;

-- =============================================================================
-- PART 1: Recreate get_current_onboarding_step using completed_steps JSONB
-- =============================================================================

CREATE FUNCTION public.get_current_onboarding_step(
    p_psychologist_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_state record;
    v_completed_steps jsonb := '[]'::jsonb;
    v_step_id text := 'identity';
    v_phase integer := 1;
    v_phase_1_complete boolean := false;
    v_phase_2_complete boolean := false;
    v_phase_3_complete boolean := false;
    v_is_complete boolean := false;
BEGIN
    IF p_psychologist_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: can only read own onboarding state';
    END IF;

    SELECT
        current_step_id,
        completed_steps,
        onboarding_completed_at
    INTO v_state
    FROM public.psychologist_onboarding_state
    WHERE psychologist_id = p_psychologist_id;

    IF v_state IS NULL THEN
        RETURN jsonb_build_object(
            'step_id', 'identity',
            'completed_steps', '[]'::jsonb,
            'phase', 1,
            'is_complete', false
        );
    END IF;

    v_completed_steps := COALESCE(v_state.completed_steps, '[]'::jsonb);

    v_phase_1_complete := v_completed_steps @> '["identity", "professional", "subscription"]'::jsonb;
    v_phase_2_complete := v_completed_steps @> '["services", "locations", "availability"]'::jsonb;
    v_phase_3_complete := v_completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience"]'::jsonb;
    v_is_complete := (v_completed_steps @> '["publish"]'::jsonb)
        OR v_state.onboarding_completed_at IS NOT NULL;

    IF v_phase_1_complete THEN
        v_phase := 2;
    END IF;

    IF v_phase_2_complete THEN
        v_phase := 3;
    END IF;

    IF v_phase_3_complete THEN
        v_phase := 4;
    END IF;

    IF NOT (v_completed_steps @> '["identity"]'::jsonb) THEN
        v_step_id := 'identity';
    ELSIF NOT (v_completed_steps @> '["professional"]'::jsonb) THEN
        v_step_id := 'professional';
    ELSIF NOT (v_completed_steps @> '["subscription"]'::jsonb) THEN
        v_step_id := 'subscription';
    ELSIF NOT (v_completed_steps @> '["services"]'::jsonb) THEN
        v_step_id := 'services';
    ELSIF NOT (v_completed_steps @> '["locations"]'::jsonb) THEN
        v_step_id := 'locations';
    ELSIF NOT (v_completed_steps @> '["availability"]'::jsonb) THEN
        v_step_id := 'availability';
    ELSIF NOT (v_completed_steps @> '["slug"]'::jsonb) THEN
        v_step_id := 'slug';
    ELSIF NOT (v_completed_steps @> '["links"]'::jsonb) THEN
        v_step_id := 'links';
    ELSIF NOT (v_completed_steps @> '["visual"]'::jsonb) THEN
        v_step_id := 'visual';
    ELSIF NOT (v_completed_steps @> '["specialties"]'::jsonb) THEN
        v_step_id := 'specialties';
    ELSIF NOT (v_completed_steps @> '["education"]'::jsonb) THEN
        v_step_id := 'education';
    ELSIF NOT (v_completed_steps @> '["experience"]'::jsonb) THEN
        v_step_id := 'experience';
    ELSE
        v_step_id := 'publish';
    END IF;

    IF v_is_complete THEN
        v_step_id := 'publish';
    ELSIF v_state.current_step_id IS NOT NULL
        AND NOT (v_completed_steps @> jsonb_build_array(v_state.current_step_id)) THEN
        v_step_id := v_state.current_step_id;
    END IF;

    RETURN jsonb_build_object(
        'step_id', v_step_id,
        'completed_steps', v_completed_steps,
        'phase', v_phase,
        'is_complete', v_is_complete
    );
END;
$function$;

COMMENT ON FUNCTION public.get_current_onboarding_step(uuid) IS 'Returns the current onboarding step using completed_steps JSONB as the SSOT.';

-- =============================================================================
-- PART 2: Recreate update_onboarding_step with required signature
-- =============================================================================

CREATE FUNCTION public.update_onboarding_step(
    p_psychologist_id uuid,
    p_step_id text,
    p_is_complete boolean,
    p_draft_data jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_current_completed jsonb := '[]'::jsonb;
    v_new_completed jsonb := '[]'::jsonb;
    v_step_id text;
    v_steps_to_apply text[];
    v_step text;
    v_updated_at timestamptz := now();
    v_onboarding_completed_at timestamptz;
BEGIN
    IF p_psychologist_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: can only update own onboarding state';
    END IF;

    v_step_id := CASE p_step_id
        WHEN 'payment' THEN 'subscription'
        WHEN 'configuration' THEN 'services'
        WHEN 'profile' THEN 'publish'
        ELSE p_step_id
    END;

    v_steps_to_apply := CASE p_step_id
        WHEN 'configuration' THEN ARRAY['services', 'locations', 'availability']
        WHEN 'profile' THEN ARRAY['publish']
        WHEN 'payment' THEN ARRAY['subscription']
        ELSE ARRAY[v_step_id]
    END;

    SELECT
        COALESCE(completed_steps, '[]'::jsonb),
        onboarding_completed_at
    INTO
        v_current_completed,
        v_onboarding_completed_at
    FROM public.psychologist_onboarding_state
    WHERE psychologist_id = p_psychologist_id;

    v_current_completed := COALESCE(v_current_completed, '[]'::jsonb);
    v_new_completed := v_current_completed;

    FOREACH v_step IN ARRAY v_steps_to_apply LOOP
        IF p_is_complete THEN
            IF NOT EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(v_new_completed) AS completed_step(step_id)
                WHERE completed_step.step_id = v_step
            ) THEN
                v_new_completed := v_new_completed || jsonb_build_array(v_step);
            END IF;
        ELSE
            SELECT COALESCE(jsonb_agg(step_value), '[]'::jsonb)
            INTO v_new_completed
            FROM jsonb_array_elements_text(v_new_completed) AS step_value
            WHERE step_value <> v_step;
        END IF;
    END LOOP;

    IF v_new_completed @> '["publish"]'::jsonb THEN
        v_onboarding_completed_at := COALESCE(v_onboarding_completed_at, v_updated_at);
    ELSIF NOT p_is_complete AND v_step_id = 'publish' THEN
        v_onboarding_completed_at := NULL;
    END IF;

    INSERT INTO public.psychologist_onboarding_state (
        psychologist_id,
        current_step_id,
        completed_steps,
        step_drafts,
        onboarding_completed_at,
        updated_at
    ) VALUES (
        p_psychologist_id,
        v_step_id,
        v_new_completed,
        jsonb_build_object(v_step_id, COALESCE(p_draft_data, '{}'::jsonb)),
        v_onboarding_completed_at,
        v_updated_at
    )
    ON CONFLICT (psychologist_id) DO UPDATE
    SET
        current_step_id = EXCLUDED.current_step_id,
        completed_steps = EXCLUDED.completed_steps,
        step_drafts = COALESCE(public.psychologist_onboarding_state.step_drafts, '{}'::jsonb) || EXCLUDED.step_drafts,
        onboarding_completed_at = EXCLUDED.onboarding_completed_at,
        updated_at = EXCLUDED.updated_at;

    UPDATE public.user_psychologists
    SET
        onboarding_completed = v_new_completed @> '["identity", "professional", "subscription"]'::jsonb,
        updated_at = v_updated_at
    WHERE id = p_psychologist_id;

    RETURN jsonb_build_object(
        'success', true,
        'step_id', v_step_id,
        'completed_steps', v_new_completed,
        'updated_at', v_updated_at
    );
END;
$function$;

COMMENT ON FUNCTION public.update_onboarding_step(uuid, text, boolean, jsonb) IS 'Updates onboarding step state using completed_steps JSONB as the SSOT.';

-- =============================================================================
-- PART 3: Recreate complete_onboarding_step using completed_steps JSONB
-- =============================================================================

CREATE FUNCTION public.complete_onboarding_step(
    p_psychologist_id uuid,
    p_step text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_result jsonb;
BEGIN
    v_result := public.update_onboarding_step(
        p_psychologist_id,
        p_step,
        true,
        '{}'::jsonb
    );

    RETURN COALESCE((v_result ->> 'success')::boolean, false);
END;
$function$;

COMMENT ON FUNCTION public.complete_onboarding_step(uuid, text) IS 'Marks an onboarding step as complete using completed_steps JSONB as the SSOT.';

-- =============================================================================
-- PART 4: Recreate sync_payment_step_with_subscription trigger function
-- =============================================================================

CREATE FUNCTION public.sync_payment_step_with_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_current_completed jsonb := '[]'::jsonb;
    v_updated_at timestamptz := now();
BEGIN
    IF NEW.subscription_status IN ('active', 'trialing') THEN
        SELECT COALESCE(completed_steps, '[]'::jsonb)
        INTO v_current_completed
        FROM public.psychologist_onboarding_state
        WHERE psychologist_id = NEW.id;

        IF NOT (v_current_completed @> '["subscription"]'::jsonb) THEN
            v_current_completed := v_current_completed || '["subscription"]'::jsonb;
        END IF;

        INSERT INTO public.psychologist_onboarding_state (
            psychologist_id,
            completed_steps,
            updated_at
        ) VALUES (
            NEW.id,
            v_current_completed,
            v_updated_at
        )
        ON CONFLICT (psychologist_id) DO UPDATE
        SET
            completed_steps = EXCLUDED.completed_steps,
            updated_at = EXCLUDED.updated_at;
    END IF;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_payment_step_with_subscription() IS 'Trigger that synchronizes the subscription onboarding step into completed_steps.';

-- =============================================================================
-- PART 5: Recreate sync_onboarding_completed_with_essential trigger function
-- =============================================================================

CREATE FUNCTION public.sync_onboarding_completed_with_essential()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_completed_steps jsonb := '[]'::jsonb;
BEGIN
    SELECT COALESCE(completed_steps, '[]'::jsonb)
    INTO v_completed_steps
    FROM public.psychologist_onboarding_state
    WHERE psychologist_id = NEW.id;

    NEW.onboarding_completed :=
        (v_completed_steps @> '["identity", "professional"]'::jsonb)
        AND (
            (v_completed_steps @> '["subscription"]'::jsonb)
            OR NEW.subscription_status IN ('active', 'trialing')
        );

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_onboarding_completed_with_essential() IS 'Trigger that synchronizes onboarding_completed based on essential steps in completed_steps.';

-- =============================================================================
-- PART 6: Recreate complete_onboarding_phase using completed_steps JSONB
-- =============================================================================

CREATE FUNCTION public.complete_onboarding_phase(
    p_psychologist_id uuid,
    p_phase integer,
    p_updates jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_current_completed jsonb := '[]'::jsonb;
    v_new_completed jsonb := '[]'::jsonb;
    v_steps_to_add text[] := ARRAY[]::text[];
    v_step text;
    v_next_step_id text := 'identity';
    v_updated_at timestamptz := now();
    v_onboarding_completed_at timestamptz;
    v_prereqs record;
    v_missing text[] := ARRAY[]::text[];
    v_completion_percentage integer := 0;
BEGIN
    IF p_psychologist_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: can only update own onboarding state';
    END IF;

    SELECT
        COALESCE(completed_steps, '[]'::jsonb),
        onboarding_completed_at
    INTO
        v_current_completed,
        v_onboarding_completed_at
    FROM public.psychologist_onboarding_state
    WHERE psychologist_id = p_psychologist_id;

    v_current_completed := COALESCE(v_current_completed, '[]'::jsonb);
    v_new_completed := v_current_completed;

    CASE p_phase
        WHEN 1 THEN
            v_steps_to_add := ARRAY['identity', 'professional', 'subscription'];
            v_next_step_id := 'services';
        WHEN 2 THEN
            SELECT *
            INTO v_prereqs
            FROM public.check_configuration_prerequisites(p_psychologist_id);

            IF NOT COALESCE(v_prereqs.has_services, false) THEN
                v_missing := array_append(v_missing, 'services');
            END IF;

            IF NOT COALESCE(v_prereqs.has_locations, false)
               AND NOT COALESCE(v_prereqs.has_online_delivery, false) THEN
                v_missing := array_append(v_missing, 'locations or online delivery');
            END IF;

            IF NOT COALESCE(v_prereqs.has_availability, false) THEN
                v_missing := array_append(v_missing, 'availability');
            END IF;

            IF array_length(v_missing, 1) > 0 THEN
                RAISE EXCEPTION 'Cannot complete Phase 2. Missing: %', array_to_string(v_missing, ', ');
            END IF;

            v_steps_to_add := ARRAY['services', 'locations', 'availability'];
            v_next_step_id := 'slug';
        WHEN 3 THEN
            v_steps_to_add := ARRAY['slug', 'links', 'visual', 'specialties', 'education', 'experience'];
            v_next_step_id := 'publish';
        WHEN 4 THEN
            v_steps_to_add := ARRAY['publish'];
            v_next_step_id := 'publish';
            v_onboarding_completed_at := COALESCE(v_onboarding_completed_at, v_updated_at);
        ELSE
            RAISE EXCEPTION 'Invalid phase: %', p_phase;
    END CASE;

    FOREACH v_step IN ARRAY v_steps_to_add LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(v_new_completed) AS completed_step(step_id)
            WHERE completed_step.step_id = v_step
        ) THEN
            v_new_completed := v_new_completed || jsonb_build_array(v_step);
        END IF;
    END LOOP;

    IF p_updates ? 'completed_steps' AND jsonb_typeof(p_updates -> 'completed_steps') = 'array' THEN
        FOR v_step IN
            SELECT jsonb_array_elements_text(p_updates -> 'completed_steps')
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(v_new_completed) AS completed_step(step_id)
                WHERE completed_step.step_id = v_step
            ) THEN
                v_new_completed := v_new_completed || jsonb_build_array(v_step);
            END IF;
        END LOOP;
    END IF;

    IF COALESCE(p_updates ->> 'onboarding_completed_at', '') <> '' THEN
        v_onboarding_completed_at := COALESCE(
            v_onboarding_completed_at,
            (p_updates ->> 'onboarding_completed_at')::timestamptz
        );
    END IF;

    v_completion_percentage := LEAST(
        100,
        (COALESCE(jsonb_array_length(v_new_completed), 0) * 100) / 13
    );

    INSERT INTO public.psychologist_onboarding_state (
        psychologist_id,
        current_step_id,
        completed_steps,
        onboarding_completed_at,
        updated_at
    ) VALUES (
        p_psychologist_id,
        v_next_step_id,
        v_new_completed,
        v_onboarding_completed_at,
        v_updated_at
    )
    ON CONFLICT (psychologist_id) DO UPDATE
    SET
        current_step_id = EXCLUDED.current_step_id,
        completed_steps = EXCLUDED.completed_steps,
        onboarding_completed_at = EXCLUDED.onboarding_completed_at,
        updated_at = EXCLUDED.updated_at;

    UPDATE public.user_psychologists
    SET
        onboarding_completed = v_new_completed @> '["identity", "professional", "subscription"]'::jsonb,
        updated_at = v_updated_at
    WHERE id = p_psychologist_id;

    RETURN jsonb_build_object(
        'success', true,
        'last_saved_at', v_updated_at,
        'completion_percentage', v_completion_percentage
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$function$;

COMMENT ON FUNCTION public.complete_onboarding_phase(uuid, integer, jsonb) IS 'Completes an onboarding phase using completed_steps JSONB as the SSOT.';

-- =============================================================================
-- PART 7: Recreate compatibility view from completed_steps JSONB
-- =============================================================================

CREATE VIEW public.psychologist_onboarding_summary WITH (security_invoker=true) AS
WITH onboarding_data AS (
    SELECT
        up.id AS psychologist_id,
        COALESCE(pos.completed_steps, '[]'::jsonb) AS completed_steps,
        COALESCE(up.subscription_status IN ('active', 'trialing'), false) AS has_active_subscription
    FROM public.user_psychologists up
    LEFT JOIN public.psychologist_onboarding_state pos
        ON pos.psychologist_id = up.id
)
SELECT
    psychologist_id,
    (
        completed_steps @> '["identity", "professional"]'::jsonb
        AND (
            completed_steps @> '["subscription"]'::jsonb
            OR has_active_subscription
        )
    ) AS essential_complete,
    (
        completed_steps @> '["identity", "professional", "subscription"]'::jsonb
        AND completed_steps @> '["services", "locations", "availability"]'::jsonb
        AND completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience", "publish"]'::jsonb
    ) AS fully_complete,
    (
        (
            CASE WHEN completed_steps @> '["identity"]'::jsonb THEN 1 ELSE 0 END
            + CASE WHEN completed_steps @> '["professional"]'::jsonb THEN 1 ELSE 0 END
            + CASE WHEN completed_steps @> '["subscription"]'::jsonb OR has_active_subscription THEN 1 ELSE 0 END
            + CASE WHEN completed_steps @> '["services", "locations", "availability"]'::jsonb THEN 1 ELSE 0 END
            + CASE WHEN completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience", "publish"]'::jsonb THEN 1 ELSE 0 END
        ) * 20
    )::integer AS completion_percentage,
    CASE
        WHEN NOT (completed_steps @> '["identity"]'::jsonb) THEN 1
        WHEN NOT (completed_steps @> '["professional"]'::jsonb) THEN 2
        WHEN NOT (completed_steps @> '["subscription"]'::jsonb OR has_active_subscription) THEN 3
        WHEN NOT (completed_steps @> '["services", "locations", "availability"]'::jsonb) THEN 4
        WHEN NOT (completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience", "publish"]'::jsonb) THEN 5
        ELSE 6
    END AS current_step,
    5 AS total_steps,
    CASE
        WHEN NOT (completed_steps @> '["identity"]'::jsonb) THEN 'identity'
        WHEN NOT (completed_steps @> '["professional"]'::jsonb) THEN 'professional'
        WHEN NOT (completed_steps @> '["subscription"]'::jsonb OR has_active_subscription) THEN 'subscription'
        WHEN NOT (completed_steps @> '["services", "locations", "availability"]'::jsonb) THEN 'configuration'
        WHEN NOT (completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience", "publish"]'::jsonb) THEN 'profile'
        ELSE NULL
    END AS next_pending_step,
    (completed_steps @> '["subscription"]'::jsonb OR has_active_subscription) AS payment_step_completed,
    (completed_steps @> '["identity"]'::jsonb) AS identity_step_completed,
    (completed_steps @> '["professional"]'::jsonb) AS professional_step_completed,
    (completed_steps @> '["services", "locations", "availability"]'::jsonb) AS configuration_step_completed,
    (completed_steps @> '["slug", "links", "visual", "specialties", "education", "experience", "publish"]'::jsonb) AS profile_step_completed
FROM onboarding_data;

COMMENT ON VIEW public.psychologist_onboarding_summary IS 'Compatibility onboarding summary view derived from completed_steps JSONB.';

-- =============================================================================
-- PART 8: Recreate get_onboarding_status_v2 with legacy return shape
-- =============================================================================

CREATE FUNCTION public.get_onboarding_status_v2(
    p_user_id uuid DEFAULT NULL::uuid
) RETURNS TABLE(
    essential_complete boolean,
    fully_complete boolean,
    completion_percentage integer,
    current_step integer,
    total_steps integer,
    next_pending_step text,
    payment_completed boolean,
    identity_completed boolean,
    professional_completed boolean,
    configuration_completed boolean,
    profile_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());

    IF v_user_id IS NULL THEN
        RETURN QUERY
        SELECT
            false,
            false,
            0,
            1,
            5,
            'subscription'::text,
            false,
            false,
            false,
            false,
            false;
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.user_psychologists
        WHERE id = v_user_id
    ) THEN
        RETURN QUERY
        SELECT
            false,
            false,
            0,
            1,
            5,
            'subscription'::text,
            false,
            false,
            false,
            false,
            false;
        RETURN;
    END IF;

    INSERT INTO public.psychologist_onboarding_state (psychologist_id)
    VALUES (v_user_id)
    ON CONFLICT (psychologist_id) DO NOTHING;

    RETURN QUERY
    SELECT
        pos.essential_complete,
        pos.fully_complete,
        pos.completion_percentage,
        pos.current_step,
        pos.total_steps,
        pos.next_pending_step,
        pos.payment_step_completed,
        pos.identity_step_completed,
        pos.professional_step_completed,
        pos.configuration_step_completed,
        pos.profile_step_completed
    FROM public.psychologist_onboarding_summary pos
    WHERE pos.psychologist_id = v_user_id;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            false,
            false,
            0,
            1,
            5,
            'subscription'::text,
            false,
            false,
            false,
            false,
            false;
    END IF;
END;
$function$;

COMMENT ON FUNCTION public.get_onboarding_status_v2(uuid) IS 'Returns compatibility onboarding progress derived from completed_steps JSONB.';

-- =============================================================================
-- PART 9: Recreate triggers
-- =============================================================================

CREATE TRIGGER trg_sync_onboarding_completed
BEFORE UPDATE OF subscription_status ON public.user_psychologists
FOR EACH ROW
EXECUTE FUNCTION public.sync_onboarding_completed_with_essential();

CREATE TRIGGER trg_sync_payment_step
AFTER UPDATE OF subscription_status ON public.user_psychologists
FOR EACH ROW
WHEN (NEW.subscription_status = ANY (ARRAY['active'::text, 'trialing'::text]))
EXECUTE FUNCTION public.sync_payment_step_with_subscription();

-- =============================================================================
-- PART 10: Grants
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.get_current_onboarding_step(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_onboarding_step(uuid, text, boolean, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding_step(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding_phase(uuid, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_onboarding_status_v2(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_payment_step_with_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_onboarding_completed_with_essential() TO authenticated;

GRANT EXECUTE ON FUNCTION public.complete_onboarding_phase(uuid, integer, jsonb) TO service_role;
GRANT SELECT ON public.psychologist_onboarding_summary TO authenticated;
GRANT SELECT ON public.psychologist_onboarding_summary TO service_role;
