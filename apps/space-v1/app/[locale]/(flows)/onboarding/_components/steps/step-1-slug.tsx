"use client";

import { FluriFieldSlugV2 } from "@workspace/forms/components/specialized/v2/fluri-field-slug-v2";
import { checkPublicProfileSlugAction } from "@workspace/supabase-data/actions/public-profile/check-public-profile-slug";

interface Step1SlugProps {
  slug: string;
  onChange: (slug: string) => void;
}

export function Step1Slug({ slug, onChange }: Step1SlugProps) {
  return (
    <FluriFieldSlugV2
      value={slug}
      onValueChange={onChange}
      checkAvailability={async (value) => {
        const result = await checkPublicProfileSlugAction({ slug: value });
        return {
          available: result.success ? result.data.available : false,
          ...(!result.success && result.error.message ? { error: result.error.message } : {}),
        };
      }}
      helperText="Este será o endereço único do seu perfil profissional e linktree."
      placeholder="seu-nome"
      autoFocus
    />
  );
}
