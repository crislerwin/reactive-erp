import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { trpc } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.scss";
import { ThemeProvider } from "@/components/ThemeToggle";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { type DefaultPageProps } from "@/common/schemas";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  const router = useRouter();

  // Pages that should not have the SideMenu layout
  const noLayoutPages = ["/sign-in", "/sign-up", "/unauthorized"];

  const shouldUseLayout = !noLayoutPages.some((path) =>
    router.pathname.startsWith(path)
  );

  const typedPageProps = pageProps as DefaultPageProps;

  return (
    <ThemeProvider>
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider localization={ptBR} {...pageProps}>
            {shouldUseLayout ? (
              <Layout
                role={typedPageProps?.role}
                branch={typedPageProps?.branch_id?.toString()}
              >
                <Component {...pageProps} />
              </Layout>
            ) : (
              <Component {...pageProps} />
            )}
          </ClerkProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ModalsProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
