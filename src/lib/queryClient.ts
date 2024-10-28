import { customErrorHandler } from "@/common/errors/customErrors";
import { QueryClient, type QueryKey } from "@tanstack/react-query";
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

export const updateQueryData = <T>(
  queryKey: QueryKey,
  updater: (data: T, variables?: Partial<T>) => T
) => {
  queryClient.setQueryData(
    queryKey,
    updater(queryClient.getQueryData(queryKey) as T)
  );
};
