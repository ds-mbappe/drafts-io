"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    // data-react-aria-top-layer prevents React Aria's ariaHideOutside()
    // from marking this portal as aria-hidden / inert when a Modal or
    // Dropdown is open — which would silently block pointer events on toasts.
    <div data-react-aria-top-layer="true" style={{ position: 'fixed', zIndex: 99999, pointerEvents: 'none' }}>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        style={{ '--z-index': '99999' } as React.CSSProperties}
        toastOptions={{
          classNames: {
            toast:
              "group toast pointer-events-auto group-[.toaster]:bg-content1 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </div>
  )
}

export { Toaster }
