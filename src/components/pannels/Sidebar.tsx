"use client"

import { cn } from '@/lib/utils'
import { memo, useCallback } from 'react'

const Sidebar = memo(
  ({ isOpen, onClose }: { isOpen?: boolean; onClose: () => void }) => {
    // const handlePotentialClose = useCallback(() => {
    //   if (window.innerWidth < 1024) {
    //     onClose()
    //   }
    // }, [onClose])

    const windowClassName = cn(
      'absolute left-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all',
      'dark:bg-black lg:dark:bg-black/30',
      !isOpen && 'border-r-transparent',
      isOpen && 'w-80 border-r border-r-neutral-200 dark:border-r-neutral-800',
    )

    return (
      <div className={windowClassName}>
        <div className="w-full h-full overflow-hidden">
          <div className="w-full h-full overflow-y-auto">
            Hello
          </div>
        </div>
      </div>
    )
  },
)

Sidebar.displayName = 'ContentSidebar'

export default Sidebar