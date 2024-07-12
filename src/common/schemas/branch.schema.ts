import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string(),
  logo_url: z.string().optional(),
  email: z.string(),
  company_code: z.string(),
  attributes: z.record(z.string()).optional(),
});

export const updateBranchSchema = z.object({
  branch_id: z.number(),
  name: z.string().optional(),
  logo_url: z.string().optional(),
  email: z.string().optional(),
  company_code: z.string().optional(),
  attributes: z.record(z.string()).optional(),
});
