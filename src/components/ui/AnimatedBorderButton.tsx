import * as React from "react"
import { motion } from "motion/react"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedBorderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const AnimatedBorderButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedBorderButtonProps
>(({ className, variant, size, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({ variant, size }),
      "relative overflow-hidden",
      className,
    )}
    {...props}
  >
    <span className="relative z-10">{children}</span>
    <motion.svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <motion.rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
      />
    </motion.svg>
  </button>
))

AnimatedBorderButton.displayName = "AnimatedBorderButton"

export { AnimatedBorderButton }
