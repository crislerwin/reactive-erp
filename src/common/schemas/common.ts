import { z } from "zod";

export const customNumberValidator = z
  .any()
  .refine((v) => v && !Number.isNaN(v), {
    message: "Campo deve ser um número",
  })
  .transform((v) => Number(v));

export const customBooleanValidator = z
  .any()
  .refine((v) => String(Boolean(v)), {
    message: "Campo deve ser um boolean",
  })
  .transform((v) => (String(Boolean(v)) === "true" ? true : false));
