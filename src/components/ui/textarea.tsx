import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea component using OpticWorks design tokens
 * Dark-mode only, modern rounded aesthetic
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          "flex min-h-[100px] w-full rounded-lg border px-3 py-2",
          "text-base text-foreground md:text-sm",
          "bg-input border-input-border",
          "placeholder:text-input-placeholder",
          "shadow-xs transition-all duration-200",
          // Focus styles
          "outline-none focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-ring",
          // Selection styles
          "selection:bg-primary selection:text-primary-foreground",
          // Error styles
          "aria-invalid:ring-error-muted aria-invalid:border-error",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Resize handle
          "resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
