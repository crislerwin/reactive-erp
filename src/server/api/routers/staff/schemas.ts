import z from "zod";

export const commonSchema = z.object({
  branch_id: z.number(),
});

export const createStaffMemberSchema = z.intersection(
  z.object({
    first_name: z.string(),
    last_name: z.string().optional(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER", "OWNER"]),
  }),
  commonSchema
);
export const updateStaffMemberSchema = z.intersection(
  z.object({
    staff_id: z.number(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER"]),
  }),
  commonSchema
);

export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;

export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;
