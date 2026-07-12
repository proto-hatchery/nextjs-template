"use client";

import { usePsychologist } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { useUser } from "@/app/_hooks/use-user";

import { WelcomeBannerSkeleton } from "./skeletons";

function resolveDisplayName({
  profileName,
  userName,
  userEmail,
}: {
  profileName?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const candidate = profileName ?? userName ?? userEmail;
  if (!candidate) return "Usuário";

  const trimmed = candidate.trim();
  if (!trimmed) return "Usuário";

  return trimmed.split(" ")[0] ?? "Usuário";
}

export function WelcomeSection() {
  const { data: profile, isPending: isProfilePending } = usePsychologist();
  const { data: user, isPending: isUserPending } = useUser();

  if (isProfilePending || isUserPending) {
    return <WelcomeBannerSkeleton />;
  }

  const displayName = resolveDisplayName({
    profileName: profile?.first_name ?? profile?.full_name ?? null,
    userName: (user?.user_metadata?.full_name as string | undefined) ?? null,
    userEmail: user?.email ?? null,
  });

  return <h1 className="text-2xl font-medium text-foreground">Boas vindas, {displayName}</h1>;
}
