import { z } from "zod";
import { customNumberValidator } from "./common";

const isValidCNPJ = (cnpj: string) => {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != Number(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != Number(digits.charAt(1))) return false;

  return true;
};

const cnpjSchema = z
  .string()
  .regex(/^\d+$/, { message: "CNPJ deve conter apenas numeros" })
  .refine(isValidCNPJ, {
    message: "CNPJ inválido",
  });

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome da filial deve ter no mínimo 3 caracteres" }),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  company_code: cnpjSchema,
  attributes: z.record(z.string()).optional(),
});

export const updateBranchSchema = z.object({
  branch_id: customNumberValidator.optional(),
  name: z
    .string()
    .min(3, {
      message: "Nome da filial deve ter no mínimo 3 caracteres",
    })
    .optional(),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  company_code: cnpjSchema.optional(),
  attributes: z.record(z.string()).optional(),
});
