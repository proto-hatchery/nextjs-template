"use server"

import { err, ok } from "neverthrow"
import { z } from "zod"

import { createAction } from "@workspace/supabase-data/lib/boundary/create-action"
import { serializeResult, type SerializedResult } from "@workspace/supabase-data/lib/boundary/serialize-result"
import { AppError, AppErrorCode } from "@workspace/supabase-data/lib/errors/app-error"

const SPACE_URL = process.env.NEXT_PUBLIC_SPACE_APP_URL ?? "http://localhost:3001"
const WEB_URL = process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "http://localhost:3002"

interface CheckoutResponse {
  url?: string
}

const createCheckoutSessionSchema = z.object({
  priceId: z.string().trim().min(1),
  successUrl: z.string().trim().min(1).optional(),
  cancelUrl: z.string().trim().min(1).optional(),
})

type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionSchema>

type CreateCheckoutSessionResponse = {
  url: string
}

const createCheckoutSession = createAction<
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse
>({
  name: "subscriptions.createCheckoutSession",
  inputSchema: createCheckoutSessionSchema,
  handler: async (input, context) => {
    const result = await context.supabase.functions.invoke<CheckoutResponse>("stripe", {
      body: {
        action: "checkout",
        payload: {
          priceId: input.priceId,
          successUrl:
            input.successUrl ?? `${SPACE_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: input.cancelUrl ?? `${WEB_URL}/onboarding/subscription`,
        },
      },
    })

    if (result.error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to create checkout session",
          result.error
        )
      )
    }

    if (!result.data?.url) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Checkout URL not received", result.data)
      )
    }

    return ok({ url: result.data.url })
  },
})

export async function createCheckoutSessionAction(
  input: CreateCheckoutSessionRequest
): Promise<SerializedResult<CreateCheckoutSessionResponse>> {
  return serializeResult(await createCheckoutSession(input))
}
