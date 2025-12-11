import { cn } from "@/lib/utils";

/**
 * Skeleton component using OpticWorks design tokens
 * Dark-mode only - loading placeholder
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-background-muted animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
