"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/**
 * Switch component using OpticWorks design tokens
 * Dark-mode only, modern rounded aesthetic
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles
        "peer inline-flex h-6 w-11 shrink-0 items-center",
        "rounded-full border border-transparent",
        "shadow-xs transition-all duration-200",
        // Checked state - primary color
        "data-[state=checked]:bg-primary",
        // Unchecked state - subtle background
        "data-[state=unchecked]:bg-background-muted",
        // Focus styles
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Disabled styles
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full",
          "bg-foreground shadow-sm",
          "ring-0 transition-transform duration-200",
          // Position based on state
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5",
          // Change thumb color when checked
          "data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
