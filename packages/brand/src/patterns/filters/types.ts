export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterDefinition {
  type: string;
  label: string;
  options: FilterOption[];
}

export interface ActiveFilter {
  type: string;
  selectedOptionIds: string[];
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    type: "modality",
    label: "Modalidade",
    options: [
      { id: "presencial", label: "Presencial" },
      { id: "online", label: "Online" },
    ],
  },
  {
    type: "status",
    label: "Status",
    options: [
      { id: "confirmed", label: "Confirmado" },
      { id: "pending", label: "Pendente" },
      { id: "cancelled", label: "Cancelado" },
    ],
  },
];
