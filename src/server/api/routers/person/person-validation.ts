import { z } from "zod";

export const createPersonInputValidation = z.object({
  email: z.string(),
  userName: z.string(),
  id: z.string().optional(),
});

export const updatePersonInputValidation = z.object({
  id: z.string(),
  email: z.string().optional(),
  companyId: z.string().optional(),
  userName: z.string().optional(),
});

export const getByIdInputValidation = z.object({
  id: z.string(),
});
