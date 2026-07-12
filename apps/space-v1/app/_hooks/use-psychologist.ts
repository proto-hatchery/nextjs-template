"use client"

import { useQuery } from "@tanstack/react-query"

import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client"

type PsychologistProfileRow = {
  first_name: string | null
  full_name: string | null
  timezone: string | null
}

/**
 * Loads the signed-in psychologist row from `user_psychologists` (fluri parity).
 */
export function usePsychologist() {
  return useQuery({
    queryKey: ["psychologist", "profile"],
    queryFn: async (): Promise<PsychologistProfileRow | null> => {
      const supabase = createBrowserAuthClient()
      const { data: claimsData } = await supabase.auth.getClaims()
      const userId = claimsData?.claims?.sub

      if (!userId) {
        return null
      }

      const { data, error } = await supabase
        .from("user_psychologists")
        .select("first_name, full_name, timezone")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
