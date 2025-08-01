import React from 'react'
import HomeFeaturedItem from './HomeFeaturedItem'
import { Button } from '@heroui/react'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

const HomeFeatured = () => {
  const items = [
    {
      id: 0,
      category: 'Technology',
      title: 'The Future of AI in Content Creation',
      description: 'Exploring how artificial intelligence is revolutionizing the way we create and consume digital content.',
      readTime: '8 min read',
    },
    {
      id: 1,
      category: 'Lifestyle',
      title: 'Building Habits That Stick',
      description: 'Science-backed strategies for creating lasting positive changes in your daily routine.',
      readTime: '6 min read',
    },
    {
      id: 2,
      category: 'Business',
      title: 'Remote Work Revolution',
      description: 'How distributed teams are reshaping the modern workplace and what it means for the future.',
      readTime: '10 min read',
    },
  ]

  return (
    <div className="w-full max-w-[1536px] justify-center items-center flex flex-col gap-8 lg:gap-16 mx-auto px-3 lg:px-10 py-10 lg:py-14">
      <div className="flex flex-col gap-3">
        <h3 className="text-[36px] font-serif font-bold text-foreground text-center">
          {'Featured drafts'}
        </h3>

        <p className="text-lg text-foreground-500 max-w-2xl text-center">
          {'Discover our most popular and thought-provoking articles, handpicked by our editorial team.'}
        </p>
      </div>

      <div className="grid grid-cols-1 grid-rows-3 md:grid-rows-2 lg:grid-rows-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <HomeFeaturedItem
            key={item.id}
            item={item}
            className={index === 0 ? 'md:col-span-2' : ''}
          />
        ))}
      </div>

      <Button
        as={Link}
        size="lg"
        href="/app"
        radius="sm"
        color="default"
        variant="bordered"
        className="hover:scale-105 transition-all text-lg font-medium"
        endContent={<ArrowRightIcon size={16} />}
      >
        {'Read all drafts'}
      </Button>
    </div>
  )
}

export default HomeFeatured