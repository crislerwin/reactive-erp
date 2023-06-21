import { z } from "zod";

export const createCompanyInputValidation = z.object({
  cnpj: z.string().min(14).max(14).regex(/^\d+$/),
  socialReason: z.string(),
  fantasyName: z.string(),
  email: z.string().email(),
});

export const updateCompanyInputValidation = z.object({
  companyId: z.number(),
  cnpj: z.string().optional(),
  socialReason: z.string().optional(),
  fantasyName: z.string().optional(),
  email: z.string().optional(),
});

export const findByIdInputValidation = z.object({ companyId: z.number() });
