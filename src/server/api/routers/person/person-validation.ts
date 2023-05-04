import { z } from "zod";

export const createPersonInputValidation = z.object({
  email: z.string(),
  userName: z.string(),
  companyId: z.number().optional(),
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
