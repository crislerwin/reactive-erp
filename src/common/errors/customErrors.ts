import { modals } from "@mantine/modals";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export enum ErrorType {
  BRANCH_NOT_FOUND = "BRANCH_NOT_FOUND",
  ACCOUNT_ALREADY_EXISTS = "ACCOUNT_ALREADY_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  NOT_ALLOWED = "NOT_ALLOWED",
}

export type CustomErrorsValues = {
  code: TRPC_ERROR_CODE_KEY;
  cause: ErrorType;
};

export const CustomError: Record<ErrorType, CustomErrorsValues> = {
  BRANCH_NOT_FOUND: {
    code: "NOT_FOUND",
    cause: ErrorType.BRANCH_NOT_FOUND,
  },
  ACCOUNT_ALREADY_EXISTS: {
    code: "BAD_REQUEST",
    cause: ErrorType.ACCOUNT_ALREADY_EXISTS,
  },
  USER_NOT_FOUND: {
    code: "NOT_FOUND",
    cause: ErrorType.USER_NOT_FOUND,
  },
  NOT_ALLOWED: {
    code: "UNAUTHORIZED",
    cause: ErrorType.NOT_ALLOWED,
  },
};

export const ErrorTranslation: Record<ErrorType | string, string> = {
  BRANCH_NOT_FOUND: "Filial não encontrada",
  ACCOUNT_ALREADY_EXISTS: "Já existe uma conta com este e-mail",
  USER_NOT_FOUND: "Usuário não encontrado",
  NOT_ALLOWED: "Você não tem permissão para realizar esta ação",
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
    children: ErrorTranslation[message] ?? message,
    closeOnEscape: true,
  });
}
