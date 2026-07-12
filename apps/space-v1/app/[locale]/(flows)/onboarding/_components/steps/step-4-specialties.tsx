"use client";

import { FluriFieldV2TagMultiSelect } from "@workspace/forms/components/specialized/v2/fluri-field-v2-tag-multi-select";

interface Step4SpecialtiesProps {
  specialties: string[];
  therapeuticApproaches: string[];
  onChange: (updates: { specialties?: string[]; therapeuticApproaches?: string[] }) => void;
}

const SPECIALTIES_OPTIONS = [
  { value: "ansiedade", label: "Ansiedade" },
  { value: "depressao", label: "Depressão" },
  { value: "burnout", label: "Burnout" },
  { value: "autoestima", label: "Autoestima" },
  { value: "relacionamentos", label: "Relacionamentos" },
  { value: "trauma", label: "Trauma" },
  { value: "tdah", label: "TDAH" },
  { value: "luto", label: "Luto" },
];

const APPROACHES_OPTIONS = [
  { value: "tcc", label: "Terapia Cognitivo-Comportamental" },
  { value: "psicanalise", label: "Psicanálise" },
  { value: "humanista", label: "Humanista" },
  { value: "gestalt", label: "Gestalt-Terapia" },
  { value: "sistemica", label: "Sistêmica" },
  { value: "junguiana", label: "Analítica (Junguiana)" },
  { value: "acp", label: "Abordagem Centrada na Pessoa" },
];

export function Step4Specialties({
  specialties,
  therapeuticApproaches,
  onChange,
}: Step4SpecialtiesProps) {
  return (
    <div className="space-y-10 w-full">
      <FluriFieldV2TagMultiSelect
        label="Palavras-chave"
        placeholder="Selecione suas palavras-chave..."
        options={SPECIALTIES_OPTIONS}
        value={specialties}
        onValueChange={(value) => onChange({ specialties: value })}
        maxSelected={5}
        helperText="Selecione até 5 palavras-chave principais."
        containerClassName="w-full"
      />

      <FluriFieldV2TagMultiSelect
        label="Abordagens Terapêuticas"
        placeholder="Selecione suas abordagens..."
        options={APPROACHES_OPTIONS}
        value={therapeuticApproaches}
        onValueChange={(value) => onChange({ therapeuticApproaches: value })}
        maxSelected={3}
        helperText="Selecione até 3 abordagens."
        containerClassName="w-full"
      />
    </div>
  );
}
