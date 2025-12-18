"use client"

import { HeroUIProvider } from "@heroui/react"
import { ReactNode, useState, useEffect } from "react"

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  )
}
