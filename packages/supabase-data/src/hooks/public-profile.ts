"use client";

import { useCallback } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";

import {
  syncPublicProfileLinksAction,
  type SyncPublicProfileLinksRequest,
} from "../actions/public-profile/sync-public-profile-links";
import {
  updatePublicSiteSettingsAction,
  type UpdatePublicSiteSettingsRequest,
} from "../actions/public-profile/update-public-site-settings";
import {
  getCurrentPublicLinksForUser,
  getCurrentPublicProfileForUser,
  getPublicLinktreeBySlug,
  getPublicPsychologistById,
  getPublicPsychologistBySlug,
  getPublicPsychologistLocationsById,
  getPublicPsychologistServicesById,
} from "../modules/public-profile/application/public-profile-queries";
import type {
  CurrentPublicLinksDTO,
  CurrentPublicProfileDTO,
  PublicLinktreeDTO,
} from "../modules/public-profile/domain/dto/public-profile.dto";
import type { PsychologistDTO } from "../modules/psychologists/domain/dto/psychologist.dto";
import type { PublicPsychologist } from "../types/entities";
import { queryKeys } from "../utils/query-keys";

async function getClientUserId(): Promise<string | null> {
  const supabase = createBrowserAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user?.id ?? null;
}

export function usePsychologistPublicProfile(): UseQueryResult<
  CurrentPublicProfileDTO | null,
  Error
> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.extendedProfile(),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return null;
      const result = await getCurrentPublicProfileForUser(supabase, userId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychologistPublicLinks(): UseQueryResult<CurrentPublicLinksDTO, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.linktreeLinks(),
    queryFn: async () => {
      const userId = await getClientUserId();
      if (!userId) return [];
      const result = await getCurrentPublicLinksForUser(supabase, userId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicPsychologist(
  psychologistId: string,
): UseQueryResult<PsychologistDTO | null, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.profile(psychologistId),
    queryFn: async () => {
      const result = await getPublicPsychologistById(supabase, psychologistId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: Boolean(psychologistId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicPsychologistServices(psychologistId: string) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.publicServices(psychologistId),
    queryFn: async () => {
      const result = await getPublicPsychologistServicesById(supabase, psychologistId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: Boolean(psychologistId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicLocations(psychologistId: string) {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.publicLocations(psychologistId),
    queryFn: async () => {
      const result = await getPublicPsychologistLocationsById(supabase, psychologistId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: Boolean(psychologistId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicPsychologistBySlug(
  slug: string,
): UseQueryResult<PublicPsychologist | null, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.public(slug),
    queryFn: async () => {
      const result = await getPublicPsychologistBySlug(supabase, slug);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicLinktreeData(slug: string): UseQueryResult<PublicLinktreeDTO | null, Error> {
  const supabase = createBrowserAuthClient();

  return useQuery({
    queryKey: queryKeys.psychologist.linktree(slug),
    queryFn: async () => {
      const result = await getPublicLinktreeBySlug(supabase, slug);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicProfileActions() {
  const updateProfile = useCallback((input: UpdatePublicSiteSettingsRequest) => {
    return updatePublicSiteSettingsAction(input);
  }, []);

  const upsertLinks = useCallback((input: SyncPublicProfileLinksRequest) => {
    return syncPublicProfileLinksAction(input);
  }, []);

  return {
    updateProfile: {
      mutate: (input: UpdatePublicSiteSettingsRequest) => {
        void updateProfile(input);
      },
      mutateAsync: updateProfile,
    },
    upsertLinks: {
      mutate: (input: SyncPublicProfileLinksRequest) => {
        void upsertLinks(input);
      },
      mutateAsync: upsertLinks,
    },
    updatePublicationPreferences: updateProfile,
    publishSite: (input: { usernameSlug: string; showInMarketplace: boolean }) =>
      updateProfile({
        usernameSlug: input.usernameSlug,
        isPublic: true,
        showInMarketplace: input.showInMarketplace,
      }),
  };
}
