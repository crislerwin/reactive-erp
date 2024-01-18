import { z } from "zod";
import { idSchema } from "./common.schema";

export const createProviderSchema = z.object({
  email: z.string(),
  full_name: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  institution_ids: z.array(z.number()).optional(),
  bio: z
    .object({
      phone_number: z.string().optional(),
      date_of_birth: z.string().optional(),
    })
    .optional(),
});

export const updateProviderSchema = z.intersection(
  createProviderSchema,
  idSchema
);
