import { Card, Chip, cn } from '@heroui/react'
import Image from 'next/image'
import React from 'react'
import heroImage from '../../../public/hero-image.jpg'
import { Clock4Icon } from 'lucide-react'

const HomeFeaturedItem = ({
  item,
  className
}: {
  item: any,
  className?: string,
}) => {
  return (
    <Card
      classNames={{
        base: cn('cursor-pointer flex flex-col transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg lg:col-span-1 lg:row-span-1 border', className)
      }}
    >
      <div className="relative overflow-hidden h-full">
        <Image
          priority
          src={heroImage}
          alt="Featured image"
          className="w-full h-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="h-full absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 left-4">
          <Chip variant="solid">
            {item?.category}
          </Chip>
        </div>
      </div>

      <div className="h-full flex flex-col gap-3 p-6">
        <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-xl lg:text-2xl">
          {item?.title}
        </h4>

        <div className="flex flex-col gap-6">
          <p className="text-foreground-500 !leading-relaxed line-clamp-3">
            {item?.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-foreground-500">
            <Clock4Icon size={16} />
            
            <span>
              {item?.readTime}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default HomeFeaturedItem