import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, describe, expect, it, vi } from "vitest"

import { getProfileByUserId } from "@workspace/supabase-data/actions/profiles/get-profile-by-user-id"
import { SupabaseRepositoryError } from "@workspace/supabase-data/lib/supabase-repository-error"
import { ProfileSupabaseRepository } from "@workspace/supabase-data/modules/profiles/infrastructure/repositories/profile-supabase.repository"

const fakeSupabase = {} as SupabaseClient

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getProfileByUserId", () => {
  it("returns the profile when the repository finds one", async () => {
    const profile = {
      avatarUrl: null,
      createdAt: "2026-03-25T00:00:00.000Z",
      fullName: "Test User",
      updatedAt: "2026-03-25T00:00:00.000Z",
      userId: "550e8400-e29b-41d4-a716-446655440000",
    }
    vi.spyOn(ProfileSupabaseRepository.prototype, "findByUserId").mockResolvedValue(profile)

    await expect(getProfileByUserId(fakeSupabase, profile.userId)).resolves.toEqual(profile)
    expect(ProfileSupabaseRepository.prototype.findByUserId).toHaveBeenCalledWith(profile.userId)
  })

  it("returns null when the repository finds no profile", async () => {
    vi.spyOn(ProfileSupabaseRepository.prototype, "findByUserId").mockResolvedValue(null)

    await expect(
      getProfileByUserId(fakeSupabase, "550e8400-e29b-41d4-a716-446655440001")
    ).resolves.toBeNull()
  })

  it("propagates repository errors", async () => {
    const cause = { code: "PGRST116", message: "error" }
    vi.spyOn(ProfileSupabaseRepository.prototype, "findByUserId").mockRejectedValue(
      new SupabaseRepositoryError("Failed to load profile.", { cause })
    )

    await expect(
      getProfileByUserId(fakeSupabase, "550e8400-e29b-41d4-a716-446655440002")
    ).rejects.toMatchObject({
      message: "Failed to load profile.",
    })
  })
})
