import { z } from "zod";

export const createCompanyInputValidation = z.object({
  cnpj: z.string().min(14).max(14).regex(/^\d+$/),
  socialReason: z.string(),
  fantasyName: z.string(),
  email: z.string().email(),
});

export const updateCompanyInputValidation = z.object({
  id: z.string(),
  cnpj: z.string().optional(),
  socialReason: z.string().optional(),
  fantasyName: z.string().optional(),
  email: z.string().optional(),
});

export const findByIdInputValidation = z.object({ id: z.string() });
