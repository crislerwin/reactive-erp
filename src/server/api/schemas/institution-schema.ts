import { z } from "zod";
import { idSchema } from "./common.schema";

export const institutionSchema = z.object({
  company_code: z.string(),
  name: z.string(),
  additional_info: z
    .object({
      description: z.string(),
      phone_number: z.string(),
    })
    .optional(),
  email: z.string().email(),
  attributes: z.record(z.string()).optional(),
  static_logo_url: z.string().url(),
  provider_ids: z.array(z.number()).optional(),
});

export const updateInstitutionSchema = z.intersection(
  institutionSchema,
  idSchema
);
