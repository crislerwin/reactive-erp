import { z } from "zod";
import { stringToBool } from "../utils";
export const customNumberValidator = z
  .any()
  .refine((v) => v && !Number.isNaN(Number(v)), {
    message: "Campo deve ser um número",
  })
  .transform((v) => Number(v));

export const customBooleanValidator = z
  .any()
  .transform((value) => stringToBool(String(value)))
  .pipe(z.boolean());
