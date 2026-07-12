"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";

export interface VideoSectionValue {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

const isValidVideoUrl = (value: string) => {
  if (!value) return false;
  const normalized = value.trim();
  const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i.test(normalized);
  const isVimeo = /vimeo\.com\/(\d+)/i.test(normalized);
  return isYouTube || isVimeo;
};

interface VideoSectionDialogProps {
  value: VideoSectionValue;
  onChange: (value: VideoSectionValue) => void;
}

export function VideoSectionDialog({ value, onChange }: VideoSectionDialogProps) {
  const urlIsValid = value.url ? isValidVideoUrl(value.url) : true;

  return (
    <div className="space-y-6">
      <FluriFieldV2Input
        label="Link do vídeo"
        value={value.url}
        onValueChange={(val) => onChange({ ...value, url: val })}
        placeholder="YouTube ou Vimeo"
        errorMessage={!urlIsValid ? "Insira um link válido do YouTube ou Vimeo." : undefined}
        helperText="Suportamos links do YouTube ou Vimeo."
        fullWidth
      />
    </div>
  );
}
