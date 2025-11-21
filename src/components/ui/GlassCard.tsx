'use client'

import { cx } from "@/lib/utils"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: 'amber' | 'blue' | 'violet'
}

export function GlassCard({ children, className, hover = true, gradient }: GlassCardProps) {
  const gradientClasses = {
    amber: 'before:bg-gradient-to-br before:from-amber-500/20 before:to-transparent',
    blue: 'before:bg-gradient-to-br before:from-blue-500/20 before:to-transparent',
    violet: 'before:bg-gradient-to-br before:from-violet-500/20 before:to-transparent',
  }

  return (
    <div className="relative">
      {/* Optional gradient orb behind the card */}
      {gradient && (
        <div
          className={cx(
            "absolute -inset-4 -z-10 rounded-full opacity-40 blur-3xl",
            gradientClasses[gradient]
          )}
        />
      )}

      <div
        className={cx(
          "glass-card rounded-3xl transition-all duration-300",
          hover && "glass-card-hover cursor-pointer",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
