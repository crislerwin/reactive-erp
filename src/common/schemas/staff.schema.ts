import z from "zod";
import { customBooleanValidator, customNumberValidator } from "./common";

export const commonSchema = z.object({
  branch_id: customNumberValidator.optional(),
});

export const createStaffMemberSchema = z.intersection(
  z.object({
    first_name: z
      .string()
      .min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
    last_name: z.string().optional().nullish(),
    email: z.string().email({ message: "Email inválido" }),
    role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER", "OWNER"], {
      invalid_type_error: "Tipo de usuário inválido",
      message: "Tipo de usuário inválido",
    }),
    active: customBooleanValidator.optional().default(true),
  }),
  commonSchema
);

export const updateStaffMemberSchema = z.intersection(
  z.object({
    id: customNumberValidator,
    first_name: z
      .string()
      .min(3, {
        message: "Nome deve ter no mínimo 3 caracteres",
      })
      .optional(),
    last_name: z.string().optional().nullish(),
    email: z.string().email({ message: "Email inválido" }).optional(),
    active: customBooleanValidator.optional().default(true),
    role: z
      .enum(["ADMIN", "EMPLOYEE", "MANAGER"], {
        invalid_type_error: "Tipo de usuário inválido",
        message: "Tipo de usuário inválido",
      })
      .optional()
      .default("EMPLOYEE"),
  }),
  commonSchema
);

export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;

export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>;
