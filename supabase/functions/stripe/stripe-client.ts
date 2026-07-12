import Stripe from "stripe"

import { StripeFunctionError } from "./errors.ts"

export function createStripeClient(): Stripe {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY")
  if (!secretKey) {
    throw new StripeFunctionError("Stripe is not configured", 500)
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover" as any,
    httpClient: Stripe.createFetchHttpClient(),
  })
}

export async function verifyStripeWebhook(req: Request, stripe: Stripe): Promise<Stripe.Event> {
  const signature = req.headers.get("stripe-signature")
  const signingSecret =
    Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") ?? Deno.env.get("STRIPE_WEBHOOK_SECRET")

  if (!signature) {
    throw new StripeFunctionError("Missing Stripe-Signature header", 400)
  }
  if (!signingSecret) {
    throw new StripeFunctionError("Stripe webhook is not configured", 500)
  }

  return stripe.webhooks.constructEventAsync(
    await req.text(),
    signature,
    signingSecret,
    undefined,
    Stripe.createSubtleCryptoProvider()
  )
}
