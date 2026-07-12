import { getOnboardingProgressAction } from "@workspace/supabase-data/actions/onboarding/get-onboarding-progress";
import { createServerAuthClient } from "@workspace/supabase-auth/server/create-server-auth-client";
import { getClaims } from "@workspace/supabase-auth/session/get-claims";
import { normalizeAuthRole, type AuthRole } from "@workspace/supabase-auth/shared/auth-role";

type AppUrls = {
  webBase: string;
  spaceUrl?: string;
  patientUrl?: string;
  assistantUrl?: string;
  adminUrl?: string;
};

type OnboardingProgress = {
  essentialComplete: boolean;
  fullyComplete: boolean;
  steps: {
    payment: boolean;
    identity: boolean;
    professional: boolean;
    configuration: boolean;
    profile: boolean;
  };
};

type ResolverInput = {
  isAuthed: boolean;
  role: AuthRole | null;
  progress?: OnboardingProgress;
  appUrls: AppUrls;
};

function safeGetUrl(kind: "web" | "psychologist" | "patient" | "assistant") {
  try {
    if (kind === "web") {
      return process.env.NEXT_PUBLIC_AUTH_APP_URL ?? process.env.NEXT_PUBLIC_WEB_URL ?? "";
    }
    if (kind === "psychologist") {
      return process.env.NEXT_PUBLIC_SPACE_APP_URL ?? process.env.NEXT_PUBLIC_SPACE_URL;
    }
    return undefined;
  } catch {
    switch (kind) {
      case "web":
        return process.env.NEXT_PUBLIC_WEB_URL ?? "";
      case "psychologist":
        return process.env.NEXT_PUBLIC_SPACE_URL;
      case "patient":
        return process.env.NEXT_PUBLIC_ME_URL;
      case "assistant":
        return process.env.NEXT_PUBLIC_DESK_URL;
      default:
        return undefined;
    }
  }
}

function toResolverProgress(value: {
  essentialComplete: boolean;
  fullyComplete: boolean;
  steps: {
    payment: boolean;
    identity: boolean;
    professional: boolean;
    configuration: boolean;
    profile: boolean;
  };
}): OnboardingProgress {
  return {
    essentialComplete: value.essentialComplete,
    fullyComplete: value.fullyComplete,
    steps: {
      identity: value.steps.identity,
      professional: value.steps.professional,
      payment: value.steps.payment,
      configuration: value.steps.configuration,
      profile: value.steps.profile,
    },
  };
}

export async function getWebOnboardingRoutingContext(): Promise<ResolverInput> {
  const claims = await getClaims();
  const userId = claims?.sub ?? null;

  const appUrls: AppUrls = {
    webBase: safeGetUrl("web") ?? "",
  };

  const spaceUrl = safeGetUrl("psychologist");
  if (spaceUrl !== undefined) appUrls.spaceUrl = spaceUrl;

  const patientUrl = safeGetUrl("patient");
  if (patientUrl !== undefined) appUrls.patientUrl = patientUrl;

  const assistantUrl = safeGetUrl("assistant");
  if (assistantUrl !== undefined) appUrls.assistantUrl = assistantUrl;

  const adminUrl = safeGetUrl("web");
  if (adminUrl !== undefined) appUrls.adminUrl = adminUrl;

  if (!userId) {
    return {
      isAuthed: false,
      role: null,
      appUrls,
    };
  }

  let role = normalizeAuthRole(
    ((claims?.app_role as string | undefined) ?? claims?.user_role) as string,
  );

  if (!role) {
    const supabase = await createServerAuthClient();
    const { data } = await supabase.rpc("get_user_role", { p_user_id: userId });
    role = data ? normalizeAuthRole(data as string) : null;
  }

  let progress: OnboardingProgress | undefined;

  if (role === "psychologist") {
    const progressSerialized = await getOnboardingProgressAction({});
    const progressResult = progressSerialized;
    if (progressResult.success && progressResult.data) {
      progress = toResolverProgress(progressResult.data);
    }
  }

  return {
    isAuthed: true,
    role,
    ...(progress !== undefined ? { progress } : {}),
    appUrls,
  };
}
