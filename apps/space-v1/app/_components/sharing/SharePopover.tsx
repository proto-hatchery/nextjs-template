"use client";

import {
  RiCloseLine,
  RiFacebookFill,
  RiGlobalLine,
  RiInstagramFill,
  RiQrCodeLine,
  RiShareLine,
  RiTiktokFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react";
import { LinktreeButton } from "@/compat/features/public-profile/ui/linktree-button";
import type { LinktreeTheme } from "@/compat/supabase/utils/linktree-themes";
import { FluriIcon } from "@workspace/ui/assets";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentType, useState } from "react";

import type { ShareService } from "./ShareServiceInfo";
import { ShareServiceInfo } from "./ShareServiceInfo";

interface SharePopoverProps {
  profileUrl: string;
  theme: LinktreeTheme;
  buttonRadius: string;
}

export function SharePopover({ profileUrl, theme, buttonRadius }: SharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState<ShareService | null>(null);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(`https://${profileUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPublicProfile = () => {
    window.open(`https://${profileUrl}`, "_blank", "noopener,noreferrer");
  };

  const services: {
    id: ShareService | "site";
    icon: ComponentType<{ className?: string | undefined }>;
    label: string;
  }[] = [
    { id: "site", icon: RiGlobalLine, label: "Meu site" },
    { id: "qr", icon: RiQrCodeLine, label: "QR Code" },
    { id: "instagram", icon: RiInstagramFill, label: "Instagram" },
    { id: "tiktok", icon: RiTiktokFill, label: "TikTok" },
    { id: "youtube", icon: RiYoutubeFill, label: "YouTube" },
    { id: "facebook", icon: RiFacebookFill, label: "Facebook" },
    { id: "twitter", icon: RiTwitterXFill, label: "X (Twitter)" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-3 border px-5 py-2.5 shadow-sm cursor-pointer transition-all group",
            buttonRadius,
          )}
          style={{
            background: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.foreground,
          }}
        >
          <span className="text-sm font-medium">{profileUrl}</span>
          <RiShareLine className="size-4 opacity-70 group-hover:opacity-100 transition-colors" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0 overflow-hidden rounded-4xl border shadow-2xl"
        align="end"
        sideOffset={8}
        style={{
          background: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.foreground,
        }}
      >
        <div className="p-6 flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Compartilhe agora</h3>
            <BrandButton
              variant="ghost"
              size="icon"
              className="size-8 rounded-full p-0"
              onClick={() => setOpen(false)}
            >
              <RiCloseLine className="size-5 opacity-70" />
            </BrandButton>
          </div>

          <div
            className="flex items-center gap-3 border rounded-3xl p-3"
            style={{ background: theme.colors.surfaceMuted, borderColor: theme.colors.border }}
          >
            <div className="size-5 flex items-center justify-center shrink-0">
              <FluriIcon className="w-full h-full" />
            </div>
            <span className="flex-1 text-base font-medium opacity-70 truncate">{profileUrl}</span>
            <LinktreeButton
              theme={theme}
              variant="primary"
              onClick={copyToClipboard}
              size="sm"
              className="h-8 px-4 text-xs font-bold"
              style={
                copied
                  ? { background: "#22c55e", borderColor: "#22c55e", color: "white" }
                  : undefined
              }
            >
              {copied ? "Copiado!" : "Copiar"}
            </LinktreeButton>
          </div>
        </div>

        <div className="h-px" style={{ background: theme.colors.border }} />

        <div className="p-6 pt-4 flex flex-col gap-4 text-left">
          <div className="flex items-start gap-3 overflow-x-auto pb-2 no-scrollbar">
            {services.map((svc) => (
              <BrandButton
                key={svc.id}
                variant="ghost"
                size="icon"
                className="flex flex-col items-center gap-2 text-[11px] font-medium opacity-80 flex-none h-auto"
                onClick={() => {
                  if (svc.id === "site") handleOpenPublicProfile();
                  else setSelectedService(svc.id);
                }}
              >
                <span
                  className="flex items-center justify-center size-12 rounded-full border"
                  style={{
                    background: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                  }}
                >
                  <svc.icon className="size-5" />
                </span>
                {svc.label}
              </BrandButton>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedService && (
              <motion.div
                key={selectedService}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-2"
              >
                <ShareServiceInfo service={selectedService} theme={theme} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}
