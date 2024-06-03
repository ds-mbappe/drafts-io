import "./globals.css";
import '../styles/index.css'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Drafts App",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Alert />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
