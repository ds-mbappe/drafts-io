"use client"

import Image from 'next/image'
import notFoundImage from '../../public/404.png'
import Link from 'next/link'
import { Button } from "@heroui/react";

export default function NotFound() {
  return (
    <main className="flex w-full h-dvh flex-col items-center justify-center gap-2 p-5">
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

        <Link href="/app">
          <Button
            className="w-fit"
            variant="ghost"
          >
            {"Back to Home"}
          </Button>
        </Link>
      </div>
    </main>
  );
}