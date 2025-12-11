import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input component using OpticWorks design tokens
 * Dark-mode only, modern rounded aesthetic
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 w-full min-w-0 rounded-lg border px-3 py-2",
        "text-base text-foreground md:text-sm",
        "bg-input border-input-border",
        "placeholder:text-input-placeholder",
        "shadow-xs transition-all duration-200",
        // File input styles
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Focus styles
        "outline-none focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
        // Selection styles
        "selection:bg-primary selection:text-primary-foreground",
        // Error styles
        "aria-invalid:ring-error-muted aria-invalid:border-error",
        // Disabled styles
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
