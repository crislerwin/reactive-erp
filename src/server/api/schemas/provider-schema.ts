import { z } from "zod";
import { idSchema } from "./common.schema";

export const providerSchema = z.object({
  email: z.string(),
  name: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  middle_name: z.string().optional(),
  bio: z
    .object({
      phone_number: z.string().optional(),
      date_of_birth: z.string().optional(),
    })
    .optional(),
});

export const updatePersonSchema = z.intersection(providerSchema, idSchema);
