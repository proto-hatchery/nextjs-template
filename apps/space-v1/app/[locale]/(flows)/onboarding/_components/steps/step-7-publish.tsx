"use client";

import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";

interface Step7PublishProps {
  showInMarketplace: boolean;
  acceptingNewPatients: boolean;
  onChange: (updates: { showInMarketplace?: boolean; acceptingNewPatients?: boolean }) => void;
}

export function Step7Publish({
  showInMarketplace,
  acceptingNewPatients,
  onChange,
}: Step7PublishProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted/40 p-2">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Mostrar no Marketplace</Label>
            <p className="text-xs text-muted-foreground">
              Permitir que pacientes te encontrem na busca.
            </p>
          </div>
          <Switch
            checked={showInMarketplace}
            onCheckedChange={(checked) => onChange({ showInMarketplace: checked })}
          />
        </div>

        <div className="h-px bg-border/40 mx-3 my-1" />

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Aceitando novos pacientes</Label>
            <p className="text-xs text-muted-foreground">Sinaliza disponibilidade na sua agenda.</p>
          </div>
          <Switch
            checked={acceptingNewPatients}
            onCheckedChange={(checked) => onChange({ acceptingNewPatients: checked })}
          />
        </div>
      </div>
    </div>
  );
}
