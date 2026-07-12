import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts"

import type { StripeRequest } from "./types.ts"

const checkoutPayloadSchema = z.object({
  cancelUrl: z.string().url(),
  priceId: z.string().trim().min(1),
  successUrl: z.string().url(),
})

const stripeSchema = z.object({
  action: z.literal("checkout"),
  payload: checkoutPayloadSchema,
})

export function validateStripeRequest(
  request: unknown
): { data: StripeRequest; success: true } | { error: string; success: false } {
  const result = stripeSchema.safeParse(request)

  if (!result.success) {
    return {
      error: result.error.issues.map((issue) => issue.message).join(", "),
      success: false,
    }
  }

  return {
    data: result.data,
    success: true,
  }
}
