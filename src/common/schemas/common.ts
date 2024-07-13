import { z } from "zod";

export const customNumberValidator = z
  .any()
  .refine((v) => v && !Number.isNaN(v), {
    message: "Campo deve ser um número",
  })
  .transform((v) => Number(v));

export const customBooleanValidator = z
  .any()
  .refine((v) => v === "true" || v === "false", {
    message: "Campo deve ser um boolean",
  })
  .transform((v) => Boolean(v));
