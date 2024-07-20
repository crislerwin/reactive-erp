import { modals } from "@mantine/modals";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export enum ErrorType {
  BRANCH_NOT_FOUND = "BRANCH_NOT_FOUND",
  ACCOUNT_ALREADY_EXISTS = "ACCOUNT_ALREADY_EXISTS",
  STAFF_MEMBER_NOT_FOUND = "STAFF_MEMBER_NOT_FOUND",
  NOT_ALLOWED = "NOT_ALLOWED",
  BRANCH_NOT_EMPTY = "BRANCH_NOT_EMPTY",
  EMAIL_ADDRESS_NOT_FOUND = "EMAIL_ADDRESS_NOT_FOUND",
  PRODUCT_CATEGORY_NOT_FOUND = "PRODUCT_CATEGORY_NOT_FOUND",
}

export type CustomErrorsValues = {
  code: TRPC_ERROR_CODE_KEY;
  cause: ErrorType;
};

export const ServerError: Record<ErrorType, CustomErrorsValues> = {
  BRANCH_NOT_FOUND: {
    code: "NOT_FOUND",
    cause: ErrorType.BRANCH_NOT_FOUND,
  },
  ACCOUNT_ALREADY_EXISTS: {
    code: "BAD_REQUEST",
    cause: ErrorType.ACCOUNT_ALREADY_EXISTS,
  },
  STAFF_MEMBER_NOT_FOUND: {
    code: "NOT_FOUND",
    cause: ErrorType.STAFF_MEMBER_NOT_FOUND,
  },
  NOT_ALLOWED: {
    code: "UNAUTHORIZED",
    cause: ErrorType.NOT_ALLOWED,
  },
  BRANCH_NOT_EMPTY: {
    code: "BAD_REQUEST",
    cause: ErrorType.BRANCH_NOT_EMPTY,
  },
  EMAIL_ADDRESS_NOT_FOUND: {
    code: "BAD_REQUEST",
    cause: ErrorType.EMAIL_ADDRESS_NOT_FOUND,
  },
  PRODUCT_CATEGORY_NOT_FOUND: {
    code: "NOT_FOUND",
    cause: ErrorType.PRODUCT_CATEGORY_NOT_FOUND,
  },
};

export const ErrorTranslation: Record<ErrorType, string> = {
  BRANCH_NOT_FOUND: "Filial não encontrada",
  ACCOUNT_ALREADY_EXISTS: "Já existe uma conta com este e-mail",
  NOT_ALLOWED: "Você não tem permissão para realizar esta ação",
  BRANCH_NOT_EMPTY: "Existem usuários cadastrados nesta filial",
  EMAIL_ADDRESS_NOT_FOUND: "E-mail não encontrado",
  PRODUCT_CATEGORY_NOT_FOUND: "Categoria de produto não encontrada",
  STAFF_MEMBER_NOT_FOUND: "Usuário não encontrado",
};

export function customErrorHandler({
  message,
  title,
}: {
  title: string;
  message: ErrorType | string;
}) {
  modals.open({
    title,
    children: ErrorTranslation[message as ErrorType] ?? message,
    closeOnEscape: true,
  });
}
