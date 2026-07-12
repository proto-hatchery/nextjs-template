"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Check, Copy, ExternalLink, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface SuccessViewProps {
  slug?: string;
}

export function SuccessView({ slug }: SuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `https://me.fluri.com.br/${slug ?? ""}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-emerald-100 overflow-hidden">
      <div className="bg-emerald-50 p-8 flex flex-col items-center text-center space-y-4 border-b border-emerald-100">
        <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 ring-4 ring-emerald-100">
          <PartyPopper className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-emerald-900">Parabéns!</h2>
          <p className="text-emerald-700">Seu site pessoal está no ar.</p>
        </div>
      </div>
      <CardContent className="space-y-6 pt-6">
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between gap-3">
          <span className="text-sm font-medium truncate text-zinc-600">{publicUrl}</span>
          <BrandButton
            size="icon-sm"
            variant="ghost"
            className="shrink-0"
            onClick={() => void handleCopy()}
          >
            {copied ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4 text-zinc-500" />
            )}
          </BrandButton>
        </div>

        <div className="grid gap-3">
          <BrandButton asChild variant="primary">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              Ver meu site <ExternalLink className="size-4 ml-2" />
            </a>
          </BrandButton>
          <BrandButton asChild variant="secondary">
            <Link href="/home">Ir para o painel</Link>
          </BrandButton>
        </div>
      </CardContent>
    </Card>
  );
}
