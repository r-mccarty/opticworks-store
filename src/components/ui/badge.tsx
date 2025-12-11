import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge variants using OpticWorks design tokens
 * Dark-mode only, modern rounded aesthetic
 */
const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-full border px-2.5 py-0.5",
    "text-xs font-medium",
    "w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
    "transition-colors duration-200",
    "overflow-hidden",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default - Primary orange
        default: [
          "border-transparent bg-primary text-primary-foreground",
          "[a&]:hover:bg-primary-hover",
        ].join(" "),

        // Secondary - Subtle background
        secondary: [
          "border-transparent bg-secondary text-secondary-foreground",
          "[a&]:hover:bg-secondary-hover",
        ].join(" "),

        // Outline - Border only
        outline: [
          "border-border bg-transparent text-foreground",
          "[a&]:hover:bg-background-subtle",
        ].join(" "),

        // Destructive - Error state
        destructive: [
          "border-transparent bg-error text-error-foreground",
          "[a&]:hover:bg-error-hover",
        ].join(" "),

        // Success - Positive state
        success: [
          "border-transparent bg-success text-success-foreground",
          "[a&]:hover:bg-success-hover",
        ].join(" "),

        // Warning - Caution state
        warning: [
          "border-transparent bg-warning text-warning-foreground",
          "[a&]:hover:bg-warning-hover",
        ].join(" "),

        // Info - Informational
        info: [
          "border-transparent bg-info text-info-foreground",
          "[a&]:hover:bg-info-hover",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
