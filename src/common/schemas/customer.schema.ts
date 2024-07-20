import z from "zod";
import { customNumberValidator } from "./common";

export const createCustomerSchema = z.object({
  customer_code: customNumberValidator,
  first_name: z.string().min(3).max(255),
  last_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(3).max(255).optional(),
});

export const updateCustomerSchema = z.object({
  customer_id: z.number().int().positive(),
  first_name: z.string().min(3).max(255).optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).max(255).optional(),
  customer_code: customNumberValidator.optional(),
});
