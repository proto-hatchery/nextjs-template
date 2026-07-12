"use client";

import { Collapsible, CollapsibleContent } from "@workspace/ui/components/collapsible";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useEffect, useState } from "react";

interface InlinePriceEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriceCents: number;
  onSave: (priceCents: number, applyToAll: boolean) => void;
  isSaving?: boolean;
  /** Variant controls styling based on container context */
  variant?: "standalone" | "embedded";
}

export function InlinePriceEditor({
  isOpen,
  onOpenChange,
  currentPriceCents,
  onSave,
  isSaving = false,
  variant = "standalone",
}: InlinePriceEditorProps) {
  const [priceInput, setPriceInput] = useState("");
  const [applyScope, setApplyScope] = useState<"single" | "all">("single");

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      const formatted = (currentPriceCents / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setPriceInput(formatted);
      setApplyScope("single");
    }
  }, [isOpen, currentPriceCents]);

  const handlePriceChange = (value: string) => {
    // Allow digits and comma only
    const clean = value.replace(/[^\d,]/g, "");
    setPriceInput(clean);
  };

  const handleSave = () => {
    // Parse input back to cents
    const cleanValue = priceInput.replace(/\./g, "").replace(",", ".");
    const floatValue = parseFloat(cleanValue);

    if (isNaN(floatValue)) return;

    const cents = Math.round(floatValue * 100);
    onSave(cents, applyScope === "all");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div
          className={cn(
            "space-y-4 p-4",
            variant === "standalone" && "mt-3 rounded-lg border bg-muted/20",
            variant === "embedded" && "border-t bg-background/50",
          )}
        >
          {/* Price Input */}
          <Field>
            <FieldLabel htmlFor="inline-price">Valor (R$)</FieldLabel>
            <Input
              id="inline-price"
              value={priceInput}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="text-base font-medium"
              placeholder="0,00"
              autoFocus
            />
          </Field>

          {/* Apply Scope Radio Group */}
          <Field>
            <FieldLabel>Aplicar alteração</FieldLabel>
            <RadioGroup
              value={applyScope}
              onValueChange={(val) => setApplyScope(val as "single" | "all")}
              className="mt-2 grid gap-2"
            >
              <div className="flex items-center space-x-3 rounded-md border bg-background p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="single" id="scope-single" />
                <Label htmlFor="scope-single" className="cursor-pointer font-normal flex-1 text-sm">
                  Apenas para esta sessão
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-md border bg-background p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="cursor-pointer font-normal flex-1 text-sm">
                  Para todas as próximas sessões deste serviço
                </Label>
              </div>
            </RadioGroup>
            <FieldDescription className="mt-2">
              {applyScope === "all"
                ? "O novo valor será salvo no contrato do paciente."
                : "O valor será aplicado apenas a esta sessão."}
            </FieldDescription>
          </Field>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <BrandButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </BrandButton>
            <BrandButton type="button" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </BrandButton>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
