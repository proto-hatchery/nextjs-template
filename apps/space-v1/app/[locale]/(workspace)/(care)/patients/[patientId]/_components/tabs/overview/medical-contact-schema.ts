import { z } from "zod";

export const medicalContactSchema = z.object({
  name: z.string().min(1, "Nome do profissional é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  notes: z.string().optional(),
});

export type MedicalContact = z.infer<typeof medicalContactSchema>;

export const specialtyOptions = [
  { value: "Psiquiatria", label: "Psiquiatria" },
  { value: "Neurologia", label: "Neurologia" },
  { value: "Clínico Geral", label: "Clínico Geral" },
  { value: "Cardiologia", label: "Cardiologia" },
  { value: "Endocrinologia", label: "Endocrinologia" },
  { value: "Pediatria", label: "Pediatria" },
  { value: "Fonoaudiologia", label: "Fonoaudiologia" },
  { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
  { value: "Fisioterapia", label: "Fisioterapia" },
  { value: "Nutrição", label: "Nutrição" },
  { value: "Outro", label: "Outro" },
];
