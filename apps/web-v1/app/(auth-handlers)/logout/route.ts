import type { NextRequest } from "next/server"

import { logoutGet } from "@workspace/supabase-auth/server/route-handlers/logout-get"

export async function GET(request: NextRequest) {
  return logoutGet(request)
}
