"use client"

import { useQuery } from "@tanstack/react-query"

import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client"

/**
 * Legacy bridge for fluri-v0 UI — identity from JWT claims (no extra auth roundtrip).
 */
export function useUser() {
  return useQuery({
    queryKey: ["auth", "claims", "legacy-user-bridge"],
    queryFn: async () => {
      const supabase = createBrowserAuthClient()
      const { data } = await supabase.auth.getClaims()
      const claims = data?.claims as Record<string, unknown> | undefined

      if (!claims?.sub) {
        return null
      }

      return {
        id: String(claims.sub),
        email: typeof claims.email === "string" ? claims.email : undefined,
        user_metadata: {
          full_name:
            (typeof claims.full_name === "string" ? claims.full_name : undefined) ??
            (typeof claims.name === "string" ? claims.name : undefined),
          avatar_url: typeof claims.avatar_url === "string" ? claims.avatar_url : undefined,
        },
      }
    },
    staleTime: 1000 * 60 * 4,
  })
}
