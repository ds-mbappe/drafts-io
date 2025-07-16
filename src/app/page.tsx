import { Button, Link, HeroUIProvider } from "@heroui/react";
import Navbar from "@/components/navigation/Navbar";
import { SquarePenIcon } from "lucide-react";

export default function Home() {
  return (
    <HeroUIProvider>
      <main className="flex h-[100dvh] flex-col bg-content1">
        <Navbar />
        
        <section className="bg-content1">
          <div className="w-full h-[80vh] flex flex-col container max-w-[675px] mx-auto px-4 gap-10 text-center justify-center items-center">
            <h1 className="text-4xl font-bold">
              {'Share Your adventures with the World !'}
            </h1>

            <p className="text-xl text-foreground-500">
              {'Create, publish, and discover amazing content from writers around the globe.'}
            </p>

            <Button
              as={Link}
              color="default"
              href="/app"
              size="lg"
              variant="faded"
            >
              {'Start writing'}
            </Button>
          </div>
        </section>

        {/* <section className="bg-content1">
          <div className="w-full h-[60vh] flex flex-col container max-w-[675px] mx-auto px-4 gap-8 text-center justify-center items-center">
            <h1 className="text-4xl font-bold">
              {'App features'}
            </h1>

            <div className="flex flex-col md:grid md:grid-cols-2">

            </div>
          </div>
        </section> */}
      </main>
    </HeroUIProvider>
  );
}