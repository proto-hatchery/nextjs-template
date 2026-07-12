"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Pill, Stethoscope } from "lucide-react";
import { motion } from "motion/react";

interface ClinicalEntryTypeSelectorProps {
  onSelectCondition: () => void;
  onSelectMedication: () => void;
}

export function ClinicalEntryTypeSelector({
  onSelectCondition,
  onSelectMedication,
}: ClinicalEntryTypeSelectorProps) {
  return (
    <motion.div
      key="selection"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="space-y-3 px-5 py-4"
    >
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/40">
        <BrandButton
          variant="ghost"
          onClick={onSelectCondition}
          className="group relative flex w-full items-center gap-4 p-4 text-left transition-all active:bg-muted h-auto justify-start"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-active:scale-95">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[15px] font-semibold text-foreground">Condição Clínica</h4>
            <p className="truncate text-[13px] text-muted-foreground">
              Transtorno, doença crônica ou deficiência
            </p>
          </div>
          <div className="absolute bottom-0 left-16 right-0 h-px bg-border/40" />
        </BrandButton>

        <BrandButton
          variant="ghost"
          onClick={onSelectMedication}
          className="group flex w-full items-center gap-4 p-4 text-left transition-all active:bg-muted h-auto justify-start"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-active:scale-95">
            <Pill className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[15px] font-semibold text-foreground">Medicação</h4>
            <p className="truncate text-[13px] text-muted-foreground">
              Medicamento em uso ou recorrente
            </p>
          </div>
        </BrandButton>
      </div>
    </motion.div>
  );
}
