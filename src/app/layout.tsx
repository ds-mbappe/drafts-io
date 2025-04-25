import "./globals.css";
import '../styles/index.css'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/Alert";
import { auth } from "@/auth";
import SessionProvider from "./SessionProvider";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ClientOnly from "./ClientOnly";

export const metadata: Metadata = {
  title: "Drafts App",
  description: "Unleash your creativity with our powerful rich text editor. Effortlessly craft, share, and explore captivating documents. Make your content public to inspire and connect with a global audience. Discover a world where your ideas reach everyone, everywhere.",
  applicationName: "Drafts App",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Daniel Stéphane" }],
  creator: "Daniel Stéphane",
  publisher: "Daniel Stéphane",
  keywords: ["Document", "Text Editor", "Creative"],
  robots: {
    index: true,
    googleBot: {
      index: true,
    }
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <NextUIProvider>
          <ClientOnly>
            <NextThemesProvider attribute="class" enableSystem defaultTheme="system">
              <SessionProvider session={session}>
                <Alert />
                {children}
                <Toaster richColors />
              </SessionProvider>
            </NextThemesProvider>
          </ClientOnly>
        </NextUIProvider>
      </body>
    </html>
  );
}
