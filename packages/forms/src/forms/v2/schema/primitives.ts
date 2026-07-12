import { z } from "zod";

export const maskedDateStringSchema = z
  .string()
  .regex(/^$|^\d{2}\/\d{2}\/\d{4}$/, "Date must be DD/MM/YYYY");

export const currencyDisplaySchema = z.string();

export const phoneDisplaySchema = z.string();

export const optionalSelectIdInputSchema = z.string();

export const optionalSelectIdSchema = z.string().min(1).optional();

export const dateOrUndefinedSchema = z.date().optional();

export const numberOrUndefinedSchema = z.number().finite().optional();

export const e164OrUndefinedSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/)
  .optional();
