"use client";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Copy, Gift, Share2 } from "lucide-react";
import { useState } from "react";

export default function ReferralPreferencesPage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://fluri.com/invite/user-123"; // Placeholder

  const handleCopy = () => {
    void navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Convide um Amigo</h3>
        <p className="text-sm text-muted-foreground">
          Compartilhe o Fluri com seus amigos e ganhe benefícios.
        </p>
      </div>
      <Separator />

      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <div className="bg-primary/10 p-4 rounded-full">
          <Gift className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2 max-w-md">
          <h4 className="text-xl font-semibold">Ganhe 1 mês grátis</h4>
          <p className="text-muted-foreground">
            Convide um amigo para o Fluri e ambos ganharão 1 mês de assinatura Pro gratuitamente
            quando eles se inscreverem.
          </p>
        </div>

        <div className="flex w-full max-w-md items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link de convite
            </Label>
            <Input id="link" defaultValue={referralLink} readOnly className="bg-muted" />
          </div>
          <BrandButton type="button" size="icon" onClick={handleCopy}>
            <span className="sr-only">Copiar</span>
            {copied ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
