import { z } from "zod";
import { providerSchema } from "./provider-schema";
import { idSchema } from "./common.schema";

export const institutionSchema = z.object({
  company_code: z.string().min(14).max(14).regex(/^\d+$/),
  name: z.string(),
  description: z.string().optional(),
  email: z.string().email(),
  attributes: z.record(z.string()).optional(),
  static_logo_url: z.string().url(),
  providers: z.array(providerSchema).optional(),
});

export const updateCompanySchema = z.intersection(institutionSchema, idSchema);
