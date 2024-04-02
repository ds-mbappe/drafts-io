import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <nav className="fixed right-8 top-8 z-40">
            <SignedIn>
              {/* Mount the UserButton component */}
              <UserButton
                afterSignOutUrl="/"
                afterMultiSessionSingleSignOutUrl="/"
                afterSwitchSessionUrl="/"
                appearance={{ variables: { colorPrimary: "#000" } }}
              />
            </SignedIn>
            <SignedOut>{/* Signed out users get sign in button */}</SignedOut>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
