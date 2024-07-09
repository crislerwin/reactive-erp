import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { trpc } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { SideBarProvider } from "@/components/SideMenu";
import { ThemeProvider } from "@/components/ThemeToggle";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ThemeProvider>
      <SideBarProvider>
        <ClerkProvider localization={ptBR} {...pageProps}>
          <Component {...pageProps} />
        </ClerkProvider>
      </SideBarProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
