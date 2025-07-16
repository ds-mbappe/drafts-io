import Image from 'next/image'
import notFoundImage from '../../public/404.png'
import { Button, Link } from "@heroui/react";

export default function NotFound() {
  return (
    <main className="flex w-full h-[100dvh] flex-col items-center justify-center gap-2 p-5">
      <Image
        src={notFoundImage}
        width={300}
        priority={true}
        alt="Not Found Image"
      />

      <div className="flex flex-col gap-8 justify-center items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-6xl font-bold text-black text-center">
            {"Oops!"}
          </h1>

          <p className="text-2xl text-muted-foreground text-center">
            {"We couldn't find the page you were looking for."}
          </p>
        </div>

        <Button
          as={Link}
          className="w-fit"
          variant="light"
          color="primary"
          href="/app"
        >
          {"Back to Home"}
        </Button>
      </div>
    </main>
  );
}