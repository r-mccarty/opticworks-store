"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toast notifications using OpticWorks design tokens
 * Dark-mode only
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group font-colfax"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-elevated group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-foreground-muted",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
          success:
            "group-[.toaster]:bg-success-muted group-[.toaster]:border-success/30 group-[.toaster]:text-success",
          error:
            "group-[.toaster]:bg-error-muted group-[.toaster]:border-error/30 group-[.toaster]:text-error",
          warning:
            "group-[.toaster]:bg-warning-muted group-[.toaster]:border-warning/30 group-[.toaster]:text-warning",
          info: "group-[.toaster]:bg-info-muted group-[.toaster]:border-info/30 group-[.toaster]:text-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
