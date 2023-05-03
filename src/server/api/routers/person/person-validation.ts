import { z } from "zod";

export const savePersonInputValidation = z.object({
  companyId: z.number(),
  email: z.string(),
  userName: z.string(),
});
export const updatePersonInputValidation = z.object({
  personId: z.number(),
  companyId: z.number().optional(),
  email: z.string().optional(),
  userName: z.string().optional(),
});

export const getByIdInputValidation = z.object({
  personId: z.number(),
});
