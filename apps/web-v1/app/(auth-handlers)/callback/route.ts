import type { NextRequest } from "next/server"

import { callbackGet } from "@workspace/supabase-auth/server/route-handlers/callback-get"

export async function GET(request: NextRequest) {
  return callbackGet(request)
}
