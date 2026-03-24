"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number | readonly number[]) => void
  disabled?: boolean
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled,
}: SliderProps) {
  const val = value?.[0] ?? defaultValue?.[0] ?? min
  const percentage = ((val - min) / (max - min)) * 100
  const trackRef = React.useRef<HTMLDivElement>(null)

  const handleChange = React.useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + pct * (max - min)
      const stepped = Math.round(raw / step) * step
      const clamped = Math.max(min, Math.min(max, stepped))
      onValueChange?.(clamped)
    },
    [disabled, min, max, step, onValueChange]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      handleChange(e.clientX)

      const onMove = (ev: PointerEvent) => handleChange(ev.clientX)
      const onUp = () => {
        document.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerup", onUp)
      }
      document.addEventListener("pointermove", onMove)
      document.addEventListener("pointerup", onUp)
    },
    [handleChange]
  )

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      style={{ height: 20 }}
    >
      <div
        ref={trackRef}
        className={cn(
          "relative h-1 w-full cursor-pointer overflow-hidden rounded-full bg-muted",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onPointerDown={handlePointerDown}
      >
        <div
          data-slot="slider-range"
          className="absolute h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        data-slot="slider-thumb"
        className={cn(
          "absolute block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none",
          "hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3",
          disabled && "pointer-events-none opacity-50"
        )}
        style={{ left: `calc(${percentage}% - 6px)` }}
        onPointerDown={handlePointerDown}
      />
    </div>
  )
}

export { Slider }
