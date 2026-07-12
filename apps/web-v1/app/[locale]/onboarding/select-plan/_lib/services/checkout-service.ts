import { createCheckoutSessionAction } from "@workspace/supabase-data/actions/subscriptions/create-checkout-session";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";

import { SITE_URL, SPACE_URL } from "../constants/plans";

interface CheckoutResponse {
  url?: string;
}

export function getLoginRedirectUrl() {
  return `${SITE_URL}/login?redirect_to=/onboarding/select-plan`;
}

export interface RequireAuthenticatedUserResponse {
  user: { id: string; email?: string } | null;
}

export async function requireAuthenticatedUser(): Promise<RequireAuthenticatedUserResponse> {
  const supabase = createBrowserAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null };
  }

  return { user };
}

export interface CreateCheckoutSessionResponse {
  url?: string;
  errorMessage?: string;
}

export type CreateCheckoutSessionPromise = Promise<CreateCheckoutSessionResponse>;

export async function createCheckoutSession(priceId: string): CreateCheckoutSessionPromise {
  const result = await createCheckoutSessionAction({
    priceId,
    successUrl: `${SPACE_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${SPACE_URL}/onboarding/select-plan`,
  });

  if (result.success) {
    return { url: result.data.url };
  }

  return { errorMessage: result.error.message };
}
