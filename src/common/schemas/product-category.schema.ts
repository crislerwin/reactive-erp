import { z } from "zod";
import { customBooleanValidator } from "./common";

const productCategoryNameSchema = z
  .string()
  .min(3, { message: "Nome da categoria deve ter no mínimo 3 caracteres" });

export const createProductCategorySchema = z.object({
  name: productCategoryNameSchema,
  active: customBooleanValidator,
  branch_id: z.number().optional(),
  description: z.string().optional(),
});

export const updateProductCategorySchema = z.object({
  id: z.number(),
  name: productCategoryNameSchema.optional(),
  branch_id: z.number().optional(),
  active: customBooleanValidator,
  description: z.string().optional(),
});
