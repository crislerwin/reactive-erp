import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { SideBarProvider } from "@/components/SideBar";
import { ThemeProvider } from "@/components/ThemeToggle";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <ThemeProvider>
        <SideBarProvider>
          <Component {...pageProps} />
        </SideBarProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
