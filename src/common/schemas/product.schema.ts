import { z } from "zod";
import { customBooleanValidator, customNumberValidator } from "./common";

export const createProductSchema = z.object({
  name: z.string(),
  price: customNumberValidator,
  stock: customNumberValidator.optional().default(0),
  currency: z.string(),
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),
  product_category_id: customNumberValidator,
  available: customBooleanValidator.optional().default(true),
});

export const updateProductSchema = z.object({
  product_id: customNumberValidator,
  name: z.string(),
  price: customNumberValidator,
  stock: customNumberValidator,
  currency: z.string(),
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),
  product_category_id: customNumberValidator,
  available: customBooleanValidator,
});
