import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

import { corsHeaders } from "./_shared/cors.ts"
import { handleStripe } from "./handler.ts"
import { logStripeEdgeEvent } from "./observability.ts"
import type { StripeResponse } from "./types.ts"
import { validateStripeRequest } from "./validation.ts"

function jsonResponse(body: StripeResponse | { error: string }, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}

serve(async (req: Request) => {
  const startedAt = Date.now()
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  try {
    const validation = validateStripeRequest(await req.json())
    if (!validation.success) {
      return jsonResponse({ error: validation.error }, 400)
    }
    const response = await handleStripe(validation.data, req)
    await logStripeEdgeEvent(req, {
      durationMs: Date.now() - startedAt,
      eventName: `stripe_${validation.data.action}_success`,
      operation: `stripe_${validation.data.action}`,
      outcome: "success",
    })
    return jsonResponse(response)
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status: number }).status)
        : 400
    await logStripeEdgeEvent(req, {
      durationMs: Date.now() - startedAt,
      eventName: "stripe_failed",
      error,
      httpStatus: status,
      operation: "stripe_operation",
      outcome: "failure",
    })
    return jsonResponse({ error: error instanceof Error ? error.message : "Stripe error" }, status)
  }
})
