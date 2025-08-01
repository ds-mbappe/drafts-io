import { Progress } from "@heroui/react"
import { memo, useCallback, useEffect, useState } from 'react'

export type ImageBlockWidthProps = {
  onChange: (value: number) => void
  value: number
}

export const ImageBlockWidth = memo(({ onChange, value }: ImageBlockWidthProps) => {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = parseInt(e.target.value)
      onChange(nextValue)
      setCurrentValue(nextValue)
    },
    [onChange],
  )

  return (
    <div className="w-full flex justify-center items-center gap-2">
      <input
        className="h-2 bg-neutral-200 border-0 rounded-sm appearance-none fill-neutral-300"
        type="range"
        min="20"
        max="100"
        step="10"
        onChange={handleChange}
        value={currentValue}
      />

      <span className="text-xs font-semibold text-foreground-500 select-none">{value}%</span>
    </div>
  )
})

ImageBlockWidth.displayName = 'ImageBlockWidth'