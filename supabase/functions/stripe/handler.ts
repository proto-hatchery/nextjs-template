import type { SupabaseClient, User } from "@supabase/supabase-js"
import Stripe from "stripe"

import { createEdgeClient } from "./_shared/supabase.ts"
import { StripeFunctionError } from "./errors.ts"
import { logStripeEdgeEvent } from "./observability.ts"
import { createStripeClient } from "./stripe-client.ts"
import type { CheckoutPayload, StripeRequest, StripeResponse } from "./types.ts"

async function requireAuthenticatedUser(
  supabase: SupabaseClient,
  req: Request
): Promise<User> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    throw new StripeFunctionError("Missing Authorization header", 401)
  }

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new StripeFunctionError("Unauthorized", 401)
  }

  return user
}

async function updateStripeAccountEmail(
  stripe: Stripe,
  accountId: string,
  email: string
): Promise<void> {
  try {
    await (stripe as any).v2.core.accounts.update(accountId, {
      contact_email: email,
    })
  } catch {
    // Email sync is best-effort; checkout can proceed with the existing account.
  }
}

async function createStripeAccount(
  stripe: Stripe,
  supabase: SupabaseClient,
  psychologistId: string,
  customerEmail: string
): Promise<string> {
  const { data: psychologist } = await supabase
    .from("user_psychologists")
    .select("first_name, last_name, display_name, full_name")
    .eq("id", psychologistId)
    .maybeSingle()

  const displayName =
    [psychologist?.first_name, psychologist?.last_name].filter(Boolean).join(" ") ||
    psychologist?.display_name ||
    psychologist?.full_name ||
    "Fluri Professional"

  const account = await (stripe as any).v2.core.accounts.create({
    configuration: {
      customer: {},
    },
    contact_email: customerEmail || undefined,
    display_name: displayName,
    identity: {
      country: Deno.env.get("STRIPE_DEFAULT_COUNTRY") ?? "BR",
    },
  })

  if (!account?.id) {
    throw new StripeFunctionError("Failed to create Stripe account", 502)
  }

  const { error } = await supabase.from("psychologist_stripe_connect").insert({
    onboarding_status: "pending",
    psychologist_id: psychologistId,
    stripe_account_id: account.id,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    throw new StripeFunctionError("Failed to persist Stripe account", 500)
  }

  return account.id
}

async function getOrCreateStripeAccount(
  stripe: Stripe,
  supabase: SupabaseClient,
  psychologistId: string,
  customerEmail: string
): Promise<string> {
  const { data, error } = await supabase
    .from("psychologist_stripe_connect")
    .select("stripe_account_id")
    .eq("psychologist_id", psychologistId)
    .maybeSingle()

  if (error) {
    throw new StripeFunctionError("Failed to fetch Stripe account", 500)
  }

  if (data?.stripe_account_id) {
    if (customerEmail) {
      await updateStripeAccountEmail(stripe, data.stripe_account_id, customerEmail)
    }
    return data.stripe_account_id
  }

  return createStripeAccount(stripe, supabase, psychologistId, customerEmail)
}

async function handleCheckout(
  stripe: Stripe,
  supabase: SupabaseClient,
  psychologistId: string,
  user: User,
  payload: CheckoutPayload,
  req: Request
): Promise<StripeResponse> {
  const accountId = await getOrCreateStripeAccount(
    stripe,
    supabase,
    psychologistId,
    user.email?.trim() ?? ""
  )

  const session = await stripe.checkout.sessions.create({
    cancel_url: payload.cancelUrl,
    client_reference_id: psychologistId,
    customer_account: accountId,
    line_items: [{ price: payload.priceId, quantity: 1 }],
    metadata: {
      psychologist_id: psychologistId,
      stripe_account_id: accountId,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        psychologist_id: psychologistId,
      },
    },
    success_url: payload.successUrl,
  } as any)

  if (!session.url) {
    throw new StripeFunctionError("Checkout URL not received", 502)
  }

  await logStripeEdgeEvent(req, {
    actorId: psychologistId,
    eventName: "stripe_checkout_session_created",
    metadata: { price_id: payload.priceId },
    operation: "stripe_checkout",
    outcome: "success",
  })

  return { url: session.url }
}

export async function handleStripe(request: StripeRequest, req: Request): Promise<StripeResponse> {
  const supabase = createEdgeClient()
  const user = await requireAuthenticatedUser(supabase, req)
  const stripe = createStripeClient()

  switch (request.action) {
    case "checkout":
      return handleCheckout(stripe, supabase, user.id, user, request.payload, req)
  }
}
