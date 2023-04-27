import { type AppType } from "next/app";
import { ptBR } from "@clerk/localizations";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
