import { z } from "zod";

export const getByIdSchema = z.object({
  id: z.string(),
});
export const createPersonSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  id: z.string().optional(),
});

export const updatePersonSchema = z.intersection(
  createPersonSchema,
  getByIdSchema
);
