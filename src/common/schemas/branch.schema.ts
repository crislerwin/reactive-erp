import { z } from "zod";
import { customNumberValidator } from "./common";

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome da filial deve ter no mínimo 3 caracteres" }),
  attributes: z.record(z.string()).optional(),
});

export const updateBranchSchema = z.object({
  branch_id: customNumberValidator.optional(),
  name: z
    .string()
    .min(3, {
      message: "Nome da filial deve ter no mínimo 3 caracteres",
    })
    .optional(),
  attributes: z.record(z.string()).optional(),
});
