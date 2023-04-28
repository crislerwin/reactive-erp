import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import { SideBarProvider } from "@/components/SideBar";
import { ThemeProvider } from "@/components/ThemeToggle";
import { MantineProvider } from "@mantine/core";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ThemeProvider>
        <SideBarProvider>
          <ClerkProvider localization={ptBR} {...pageProps}>
            <Component {...pageProps} />
          </ClerkProvider>
        </SideBarProvider>
      </ThemeProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);
