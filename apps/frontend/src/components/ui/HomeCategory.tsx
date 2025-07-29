import React from 'react'
import HomeCategoryCard from './HomeCategoryCard'

const HomeCategory = () => {
  const items = [
    { id: 'technology', title: 'Technology', description: 'Latest trends in tech, programming, and digital innovation', articleCount: 1200, iconClass: 'text-blue-500', hoverClass: 'group-hover:text-blue-500', icon: 'Code' },
    { id: 'lifestyle', title: 'Lifestyle', description: 'Health, wellness, productivity, and personal development', articleCount: 850, iconClass: 'text-pink-500', hoverClass: 'group-hover:text-pink-500', icon: 'Heart' },
    { id: 'business', title: 'Business', description: 'Entrepreneurship, leadership, and industry insights', articleCount: 920, iconClass: 'text-green-500', hoverClass: 'group-hover:text-green-500', icon: 'Briefcase' },
    { id: 'design', title: 'Design', description: 'UI/UX, creative processes, and visual storytelling', articleCount: 640, iconClass: 'text-purple-500', hoverClass: 'group-hover:text-purple-500', icon: 'Palette' },
    { id: 'innovation', title: 'Innovation', description: 'Cutting-edge ideas and breakthrough discoveries', articleCount: 380, iconClass: 'text-orange-500', hoverClass: 'group-hover:text-orange-500', icon: 'Zap' },
    { id: 'education', title: 'Education', description: 'Learning resources, tutorials, and skill development', articleCount: 750, iconClass: 'text-cyan-500', hoverClass: 'group-hover:text-cyan-500', icon: 'BookOpen' },
  ]

  return (
    <div className="w-full max-w-[1536px] justify-center items-center flex flex-col gap-8 lg:gap-16 mx-auto px-3 lg:px-10 py-10 lg:py-14">
      <div className="flex flex-col gap-3">
        <h3 className="text-[36px] font-serif font-bold text-foreground text-center">
          {'Explore by Category'}
        </h3>

        <p className="text-lg text-foreground-500 max-w-2xl text-center">
          {"Find exactly what you're looking for with our organized content categories."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {items.map((item) => (
          <HomeCategoryCard
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </div>
  )
}

export default HomeCategory