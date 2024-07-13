import { z } from "zod";

export const customNumberValidator = z
  .any()
  .refine((v) => !Number.isNaN(v), {
    message: "Valor inválido",
  })
  .transform((v) => Number(v));

export const customBooleanValidator = z
  .any()
  .refine((v) => v === "true" || v === "false")
  .transform((v) => Boolean(v));
