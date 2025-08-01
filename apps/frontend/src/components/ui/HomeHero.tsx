import { Button, Chip } from '@heroui/react'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import heroImage from '../../../public/hero-image.jpg'

const HomeHero = () => {
  return (
    <div className="w-full max-w-[1536px] justify-center items-center flex flex-col xl:flex-row gap-5 xl:gap-16 mx-auto px-3 xl:px-10 py-10 xl:py-14">
      <div className="flex flex-col gap-5">
        <Chip color="primary" variant="flat" startContent={<SparklesIcon size={16} />} className="px-3 mx-auto xl:mx-0">
          {'Welcome to Drafts'}
        </Chip>

        <h2 className="text-3xl sm:text-4xl xl:text-[60px] font-serif font-bold text-foreground leading-tight! text-center xl:text-start">
          {'Stories that'}
          {/* {bg-text-gradient bg-clip-text text-transparent} */}
          <span className="">
            {' inspire'}
          </span>
          {', ideas that'}
          <span className="">
            {' transform'}            
          </span>
        </h2>

        <div className="hidden xl:h-5" />

        <p className="text-lg sm:text-xl text-foreground-500 leading-relaxed max-w-lg text-center xl:text-start mx-auto xl:mx-0">
          {'Discover thought-provoking articles, expert insights, and engaging stories from writers around the world. Join a community of curious minds.'}
        </p>

        <div className="xl:h-5" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
          <Button
            as={Link}
            href="/app"
            size="lg"
            radius="sm"
            color="primary"
            variant="shadow"
            className="hover:scale-105 transition-all text-lg font-medium"
            endContent={<ArrowRightIcon size={16} />}
          >
            {'Start reading'}
          </Button>

          <Button
            as={Link}
            href="/"
            size="lg"
            radius="sm"
            color="default"
            variant="bordered"
            className="hover:scale-105 transition-all text-lg font-medium"
          >
            {'Explore categories'}
          </Button>
        </div>

        <div className="h-4 xl:h-12" />
      </div>

      <Image
        priority
        height={275}
        src={heroImage}
        alt="Hero image"
        className="w-full rounded-lg xl:rounded-2xl bg-contain"
      />
    </div>
  )
}

export default HomeHero