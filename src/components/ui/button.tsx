import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500/50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-amber-500 text-white glow-amber hover:bg-amber-600 hover:glow-amber-lg",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-glow-white",
        outline:
          "border border-glass-border bg-glass backdrop-blur-glass hover:bg-glass-light text-white",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-glass",
        ghost:
          "hover:bg-white/10 text-white",
        link: "text-amber-500 underline-offset-4 hover:underline hover:text-amber-400",
        glass:
          "glass-card text-white hover:bg-white/10 glow-white",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-lg has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-pill px-8 has-[>svg]:px-6 text-base",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
