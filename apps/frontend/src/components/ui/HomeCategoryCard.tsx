import { Card, CardBody, cn } from '@heroui/react'
import React from 'react'
import Icon from './Icon'
import Link from 'next/link'

const HomeCategoryCard = ({
  item
}: {
  item: any
}) => {
  return (
    <Link href="/">
      <Card
        classNames={{
          base: "cursor-pointer flex flex-col transition-all duration-300 grou hover:bg-foreground-100 hover:-translate-y-1 hover:shadow-lg lg:col-span-1 lg:row-span-1 border dark:border-0"
        }}
      >
        <CardBody className="flex-row gap-4 p-6">
          <div className="w-fit h-fit p-3 rounded-lg bg-background shadow-sm">
            <Icon name={item?.icon} className={item?.iconClass} />
          </div>

          <div className="flex flex-col gap-2">
            <h4 className={cn("text-xl font-serif font-bold text-foreground transition-colors", item?.hoverClass)}>
              {item?.title}
            </h4>

            <div className="flex flex-col gap-3">
              <p className="text-foreground-500 !leading-relaxed line-clamp-3">
                {item?.description}
              </p>

              <p className="text-sm text-foreground-500">
                {`${item?.articleCount} ${item?.articleCount > 1 ? 'articles' : 'article'}`}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export default HomeCategoryCard