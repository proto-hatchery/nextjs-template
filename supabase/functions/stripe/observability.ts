import { createEdgeClient } from "./_shared/supabase.ts"

type StripeEdgeEvent = {
  actorId?: string
  durationMs?: number
  error?: unknown
  eventName: string
  httpStatus?: number
  metadata?: Record<string, unknown>
  operation: string
  outcome: "failure" | "success"
}

function getEnvironment(): "dev" | "local" | "prod" | "stg" {
  const value = Deno.env.get("ENVIRONMENT")
  return value === "dev" || value === "stg" || value === "prod" ? value : "local"
}

function serializeError(error: unknown): string | null {
  if (!error) {
    return null
  }

  return error instanceof Error ? error.message : String(error)
}

async function hashActorId(actorId: string | undefined): Promise<string | null> {
  if (!actorId) {
    return null
  }

  const data = new TextEncoder().encode(actorId)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function logStripeEdgeEvent(req: Request, event: StripeEdgeEvent): Promise<void> {
  try {
    const supabase = createEdgeClient()

    await supabase.from("unified_events").insert({
      actor_id_hash: await hashActorId(event.actorId),
      actor_type: event.actorId ? "authenticated" : "anonymous",
      component: "stripe",
      duration_ms: event.durationMs ?? null,
      environment: getEnvironment(),
      error_message: serializeError(event.error),
      event_family: "operational",
      event_name: event.eventName,
      http_status: event.httpStatus ?? null,
      metadata: event.metadata ?? {},
      operation: event.operation,
      operation_type: "edge_function",
      outcome: event.outcome,
      request_path: new URL(req.url).pathname,
      service: "edge-functions",
      trace_id: crypto.randomUUID(),
      user_agent: req.headers.get("user-agent"),
    })
  } catch {
    // Observability must not block Stripe checkout.
  }
}
