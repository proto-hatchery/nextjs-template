"use client";

import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";
import { BrandButton } from "@workspace/brand/components/brand-button";

export type ShareService = "qr" | "instagram" | "tiktok" | "youtube" | "facebook" | "twitter";

interface ShareServiceInfoProps {
  service: ShareService;
  theme: LinktreeTheme;
}

export function ShareServiceInfo({ service, theme }: ShareServiceInfoProps) {
  switch (service) {
    case "qr":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-base font-semibold">QR Code do seu perfil</h4>
            <p className="text-sm opacity-70">
              Aqui está o QR Code do seu perfil Fluri. Quando alguém escanear esse código, será
              direcionado para a sua página digital.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-2xl border p-4"
              style={{
                background: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.foreground,
              }}
            >
              <svg viewBox="0 0 120 120" className="w-full h-full" fill="currentColor">
                <rect x="8" y="8" width="28" height="28" />
                <rect x="84" y="8" width="28" height="28" />
                <rect x="8" y="84" width="28" height="28" />
                <rect x="16" y="16" width="12" height="12" fill={theme.colors.background} />
                <rect x="92" y="16" width="12" height="12" fill={theme.colors.background} />
                <rect x="16" y="92" width="12" height="12" fill={theme.colors.background} />
                <rect x="48" y="20" width="8" height="8" />
                <rect x="60" y="20" width="8" height="8" />
                <rect x="48" y="32" width="8" height="8" />
                <rect x="60" y="44" width="8" height="8" />
                <rect x="72" y="44" width="8" height="8" />
                <rect x="48" y="56" width="8" height="8" />
                <rect x="60" y="68" width="8" height="8" />
                <rect x="72" y="68" width="8" height="8" />
                <rect x="84" y="56" width="8" height="8" />
                <rect x="32" y="72" width="8" height="8" />
                <rect x="44" y="84" width="8" height="8" />
                <rect x="56" y="84" width="8" height="8" />
                <rect x="68" y="84" width="8" height="8" />
                <rect x="80" y="84" width="8" height="8" />
              </svg>
            </div>
          </div>

          <div
            className="flex items-center justify-between rounded-2xl border p-3"
            style={{
              background: theme.colors.surfaceMuted,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300" />
              <span className="text-sm font-semibold">Personalizar</span>
            </div>
            <BrandButton
              type="button"
              variant="secondary"
              className="h-7 rounded-full px-3 text-xs font-semibold"
            >
              Em breve
            </BrandButton>
          </div>

          <div className="space-y-3">
            <BrandButton
              variant="secondary"
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left"
              style={{
                background: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div>
                <p className="text-sm font-semibold">Baixar PNG</p>
                <p className="text-xs opacity-60">Imagem em alta qualidade</p>
              </div>
              <span className="text-xs font-semibold opacity-60">.PNG</span>
            </BrandButton>
          </div>
        </div>
      );
    case "instagram":
      return (
        <div className="space-y-3 text-sm">
          <h4 className="text-base font-semibold">Adicionar seu link no Instagram</h4>
          <ol className="list-decimal pl-5 space-y-2 opacity-80">
            <li>Abra o Instagram no celular e vá ao seu perfil.</li>
            <li>Toque em “Editar perfil”.</li>
            <li>Cole o seu link da Fluri no campo “Site” ou “Links”.</li>
            <li>Salve as alterações.</li>
          </ol>
        </div>
      );
    case "tiktok":
      return (
        <div className="space-y-3 text-sm">
          <h4 className="text-base font-semibold">Adicionar seu link no TikTok</h4>
          <ol className="list-decimal pl-5 space-y-2 opacity-80">
            <li>Abra o TikTok e vá ao seu perfil.</li>
            <li>Toque em “Editar perfil”.</li>
            <li>Procure pelo campo “Site” e cole o seu link.</li>
            <li>Salve as alterações.</li>
          </ol>
        </div>
      );
    case "youtube":
      return (
        <div className="space-y-3 text-sm">
          <h4 className="text-base font-semibold">Adicionar seu link no YouTube</h4>
          <ol className="list-decimal pl-5 space-y-2 opacity-80">
            <li>Acesse o YouTube Studio no computador ou app.</li>
            <li>Vá em “Personalização” e depois em “Informações básicas”.</li>
            <li>Adicione o seu link da Fluri na seção de links.</li>
            <li>Salve as alterações.</li>
          </ol>
        </div>
      );
    case "facebook":
      return (
        <div className="space-y-3 text-sm">
          <h4 className="text-base font-semibold">Adicionar seu link no Facebook</h4>
          <ol className="list-decimal pl-5 space-y-2 opacity-80">
            <li>Vá ao seu perfil ou página no Facebook.</li>
            <li>Clique em “Editar detalhes” ou “Informações”.</li>
            <li>Encontre a seção de links e adicione seu link da Fluri.</li>
            <li>Salve as alterações.</li>
          </ol>
        </div>
      );
    case "twitter":
      return (
        <div className="space-y-3 text-sm">
          <h4 className="text-base font-semibold">Adicionar seu link no X (Twitter)</h4>
          <ol className="list-decimal pl-5 space-y-2 opacity-80">
            <li>Abra o X e vá ao seu perfil.</li>
            <li>Clique em “Editar perfil”.</li>
            <li>No campo “Site”, cole o seu link da Fluri.</li>
            <li>Salve as alterações.</li>
          </ol>
        </div>
      );
    default:
      return null;
  }
}
