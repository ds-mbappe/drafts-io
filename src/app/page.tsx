import Footer from "@/components/ui/Footer";
import HomeCategory from "@/components/ui/HomeCategory";
import HomeFeatured from "@/components/ui/HomeFeatured";
import HomeHero from "@/components/ui/HomeHero";
import NavbarApp from "@/components/ui/NavbarApp";
import { HeroUIProvider } from "@heroui/react";

export default function Home() {
  return (
    <HeroUIProvider>
      <main className="flex flex-col overflow-y-auto">
        <NavbarApp />
        
        <div className="w-full h-[calc(100dvh-65px)] flex flex-col">
          <HomeHero />

          <HomeFeatured />

          <HomeCategory />

          <Footer />
        </div>
      </main>
    </HeroUIProvider>
  );
}