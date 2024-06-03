import { Link, NextUIProvider } from "@nextui-org/react";
import Navbar from "@/components/navigation/Navbar";

export default function Home() {
  
  return (
    <NextUIProvider>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-200">
        <Navbar />
        
        <h1 className="max-w-7xl border-b-4 border-r-4 border-t-4 border-primary py-8 pr-4 text-4xl font-medium sm:text-6xl md:text-7xl lg:text-8xl">
          Log into your Drafts App account.
        </h1>

        <>
          <Link href="/account/sign-up">
            Sign-up
          </Link>
          
          <Link href="/account/sign-in">
            Sign-in
          </Link>
        </>
      </main>
    </NextUIProvider>
  );
}