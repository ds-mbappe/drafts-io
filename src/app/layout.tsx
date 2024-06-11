import "./globals.css";
import '../styles/index.css'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/Alert";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider"

export const metadata: Metadata = {
  title: "Drafts App",
  description: "",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Alert />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
