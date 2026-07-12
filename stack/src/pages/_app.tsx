import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ToastContainer />
            <Component {...pageProps} />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
