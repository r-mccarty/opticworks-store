import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { RiLoader2Fill } from "@remixicon/react";

import { cn } from "@/lib/utils";

/**
 * Button variants using OpticWorks design tokens
 * Dark-mode only, modern rounded aesthetic
 */
const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium",
    "rounded-lg", // Modern rounded
    "transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    "shrink-0 [&_svg]:shrink-0",
    "outline-none cursor-pointer",
    // Focus ring using design tokens
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Orange accent with glow on hover
        default: [
          "bg-primary text-primary-foreground",
          "shadow-md",
          "hover:bg-primary-hover hover:shadow-glow-primary",
          "active:bg-primary-active",
        ].join(" "),

        // Secondary - Elevated surface
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm",
          "hover:bg-secondary-hover",
        ].join(" "),

        // Outline - Transparent with border
        outline: [
          "border border-border bg-transparent",
          "text-foreground",
          "hover:bg-background-subtle hover:border-border-hover",
        ].join(" "),

        // Ghost - No background until hover
        ghost: [
          "text-foreground-muted",
          "hover:bg-background-subtle hover:text-foreground",
        ].join(" "),

        // Destructive - Error state
        destructive: [
          "bg-error text-error-foreground",
          "shadow-sm",
          "hover:bg-error-hover",
        ].join(" "),

        // Link - Text only with underline
        link: ["text-primary underline-offset-4 hover:underline"].join(" "),

        // Success - For positive actions
        success: [
          "bg-success text-success-foreground",
          "shadow-sm",
          "hover:bg-success-hover hover:shadow-glow-success",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 gap-1.5 rounded-md text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-2">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
