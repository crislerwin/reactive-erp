import { customErrorHandler } from "@/common/errors/common";
import { QueryClient } from "@tanstack/react-query";
import { type TRPCClientErrorBase } from "@trpc/client";
import { type DefaultErrorShape } from "@trpc/server";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      onError: (error) => {
        const err = error as TRPCClientErrorBase<DefaultErrorShape>;
        customErrorHandler({
          title: "❗ Uh-oh! Houve um Erro",
          message: err.message,
        });
      },
    },
  },
});
