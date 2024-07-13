import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { trpc } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { SideBarProvider } from "@/components/SideMenu";
import { ThemeProvider } from "@/components/ThemeToggle";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ThemeProvider>
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider localization={ptBR} {...pageProps}>
            <SideBarProvider>
              <Component {...pageProps} />
            </SideBarProvider>
          </ClerkProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ModalsProvider>
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
