import { z } from "zod";
import { customBooleanValidator, customNumberValidator } from "./common";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome do produto deve ter no mínimo 3 caracteres" }),
  price: customNumberValidator,
  stock: customNumberValidator.optional().default(0),
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),
  product_category_id: customNumberValidator,
  available: customBooleanValidator,
});

export const updateProductSchema = z.object({
  product_id: customNumberValidator,
  name: z
    .string()
    .min(3, { message: "Nome do produto deve ter no mínimo 3 caracteres" }),
  price: customNumberValidator,
  stock: customNumberValidator,
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),
  product_category_id: customNumberValidator,
  available: customBooleanValidator.optional(),
});
