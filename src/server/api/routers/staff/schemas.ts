import z from "zod";

export const commonSchema = z.object({
  branch_id: z.number(),
});

export const createStaffMemberSchema = z.intersection(
  z.object({
    first_name: z
      .string()
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    last_name: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }),
    role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER", "OWNER"], {
      invalid_type_error: "Tipo de usuário inválido",
    }),
    active: z.boolean().default(true),
  }),
  commonSchema
);
export const updateStaffMemberSchema = z.intersection(
  z.object({
    staff_id: z.number(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    active: z.boolean().optional().default(true),
    role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER"]).optional(),
  }),
  commonSchema
);

export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;

export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;
