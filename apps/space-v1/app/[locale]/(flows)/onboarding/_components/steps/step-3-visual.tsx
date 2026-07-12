"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2TextArea } from "@workspace/forms/components/base/v2/fluri-field-v2-textarea";

import { AvatarUpload } from "../avatar-upload";

interface Step3VisualProps {
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string | undefined;
  onChange: (updates: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    avatarPath?: string;
  }) => void;
}

export function Step3Visual({
  displayName,
  bio,
  avatarUrl,
  avatarPath,
  onChange,
}: Step3VisualProps) {
  const handleAvatarChange = (url: string | undefined, path: string | undefined) => {
    onChange({
      ...(url !== undefined ? { avatarUrl: url } : {}),
      ...(path !== undefined ? { avatarPath: path } : {}),
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Avatar Upload */}
      <AvatarUpload avatarUrl={avatarUrl} avatarPath={avatarPath} onChange={handleAvatarChange} />

      {/* Form Fields */}
      <div className="space-y-4">
        <FluriFieldV2Input
          label="Nome Profissional"
          value={displayName}
          onValueChange={(value) => onChange({ displayName: value })}
          placeholder="Ex: Dra. Ana Silva"
          fullWidth={true}
        />

        <FluriFieldV2TextArea
          label="Apresentação curta"
          value={bio}
          onValueChange={(value) => onChange({ bio: value })}
          placeholder="Psicóloga clínica especializada em TCC..."
          rows={4}
          fullWidth={true}
          helperText={
            <span className="flex justify-end w-full text-xs text-zinc-400">
              {bio.length}/160 caracteres
            </span>
          }
        />
      </div>
    </div>
  );
}
