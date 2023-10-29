import { z } from "zod";

export const idSchema = z.object({ id: z.string() });

export const createCompanySchema = z.object({
  cnpj: z.string().min(14).max(14).regex(/^\d+$/),
  socialReason: z.string(),
  fantasyName: z.string(),
  email: z.string().email(),
});

export const updateCompanySchema = z.intersection(
  createCompanySchema,
  idSchema
);
