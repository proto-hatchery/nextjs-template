import { z } from "zod";

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  relationship: z.string().min(1, "Grau de parentesco é obrigatório"),
});

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

export const relationshipOptions = [
  { value: "Mãe", label: "Mãe" },
  { value: "Pai", label: "Pai" },
  { value: "Filho(a)", label: "Filho(a)" },
  { value: "Cônjuge", label: "Cônjuge" },
  { value: "Irmão(ã)", label: "Irmão(ã)" },
  { value: "Avô/Avó", label: "Avô/Avó" },
  { value: "Tio(a)", label: "Tio(a)" },
  { value: "Primo(a)", label: "Primo(a)" },
  { value: "Amigo(a)", label: "Amigo(a)" },
  { value: "Outro", label: "Outro" },
];
