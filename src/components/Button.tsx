/**
 * @deprecated Import Button from "@/components/ui/button" instead.
 * This file provides backward compatibility and will be removed in a future version.
 *
 * Migration guide:
 * - `variant="primary"` → `variant="default"`
 * - `variant="secondary"` → `variant="secondary"` (no change)
 * - `variant="light"` → `variant="outline"` (closest match in dark theme)
 * - `variant="ghost"` → `variant="ghost"` (no change)
 * - `variant="destructive"` → `variant="destructive"` (no change)
 */

// Re-export everything from the canonical button location
export { Button, buttonVariants } from "@/components/ui/button";
export type { ButtonProps } from "@/components/ui/button";
