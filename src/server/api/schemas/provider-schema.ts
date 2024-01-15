import { z } from "zod";
import { idSchema } from "./common.schema";

export const providerSchema = z.object({
  email: z.string(),
  name: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  middle_name: z.string().optional(),
  institution_ids: z.array(z.number()).optional(),
  bio: z
    .object({
      phone_number: z.string().optional(),
      date_of_birth: z.string().optional(),
    })
    .optional(),
});

export const updatePersonSchema = z.intersection(providerSchema, idSchema);
