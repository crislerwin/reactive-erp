import z from "zod";

export const createCustomerSchema = z.object({
  customer_code: z.number().int().positive(),
  first_name: z.string().min(3).max(255),
  last_name: z.string().min(3).max(255).optional(),
  email: z.string().email(),
  phone: z.string().min(3).max(255).optional(),
});
