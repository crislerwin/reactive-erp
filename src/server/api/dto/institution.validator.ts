import { z } from "zod";

export const createInstitutionSchema = z.object({
  institution_id: z.number(),
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
});

export const updateInstitutionSchema = createInstitutionSchema;
