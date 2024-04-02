import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link className={buttonVariants({ variant: "default" })} href="/app">
        Go to App
      </Link>
    </main>
  );
}
