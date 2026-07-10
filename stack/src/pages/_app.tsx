import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainer />
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
