import z from "zod";

export const createCustomerSchema = z.object({
  customer_code: z.number().int().positive(),
  first_name: z.string().min(3).max(255),
  last_name: z.string().min(3).max(255).optional(),
  email: z.string().email(),
  phone: z.string().min(3).max(255).optional(),
});

export const updateCustomerSchema = z.object({
  customer_id: z.number().int().positive(),
  first_name: z.string().min(3).max(255).optional(),
  last_name: z.string().min(3).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).max(255).optional(),
});
