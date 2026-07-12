import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}
