import { Skeleton } from "@heroui/react";

export const DraftPageFallback = () => (
  <div className="w-full flex flex-col">
    {/* Toolbar skeleton */}
    <div className="sticky top-0 z-20 w-full border-b border-divider px-4 py-2 flex items-center gap-3 bg-background">
      <Skeleton className="w-7 h-7 rounded-full" />
      <Skeleton className="w-7 h-7 rounded-full" />
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-7 h-7 rounded-full" />
      <Skeleton className="w-7 h-7 rounded-full" />
    </div>

    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 px-5 py-16">
      {/* Cover */}
      <Skeleton className="w-full h-[280px] rounded-xl" />
      {/* Title */}
      <Skeleton className="w-3/4 h-9 rounded-lg" />
      {/* Intro */}
      <Skeleton className="w-1/2 h-5 rounded-lg" />
      {/* Content lines */}
      <div className="flex flex-col gap-3 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 rounded-lg ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  </div>
);
