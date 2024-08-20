import "./globals.css";
import '../styles/index.css'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/Alert";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Drafts App",
  description: "",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <SessionProvider session={session} basePath="/app">
            <Alert />
            {children}
            <Toaster richColors/>
          </SessionProvider>
        </NextThemesProvider>
      </NextUIProvider>
      </body>
    </html>
  );
}
