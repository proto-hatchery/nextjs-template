import { normalizeOptionalStringValue } from "@workspace/forms/v2/kernel";
import { v2Codecs } from "@workspace/forms/v2/schema";
import { z } from "zod";

export const optionalStringCodec = z.codec(
  z.union([z.string(), z.null(), z.undefined()]),
  z.string().optional(),
  {
    decode: (value) => normalizeOptionalStringValue(value),
    encode: (value) => value ?? "",
  },
);

export const invitePatientSchema = z.object({
  first_name: optionalStringCodec,
  last_name: optionalStringCodec,
  phone: v2Codecs.phoneCodec.refine((value) => Boolean(value), "Telefone é obrigatório"),
});

export type InvitePatientFormValues = z.output<typeof invitePatientSchema>;
