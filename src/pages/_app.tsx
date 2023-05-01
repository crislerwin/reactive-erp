import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { SideBarProvider } from "@/components/SideBar";
import { ThemeProvider } from "@/Providers";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ThemeProvider>
      <SideBarProvider>
        <ClerkProvider localization={ptBR} {...pageProps}>
          <Component {...pageProps} />
        </ClerkProvider>
      </SideBarProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
