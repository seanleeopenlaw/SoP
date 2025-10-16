import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionCardProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Size variant for padding
   * - compact: p-4
   * - default: p-6
   * - spacious: p-8
   */
  size?: "compact" | "default" | "spacious"
}

const SectionCard = React.forwardRef<HTMLElement, SectionCardProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "border-2 rounded-lg border-border bg-card",
          size === "compact" && "p-4",
          size === "default" && "p-6",
          size === "spacious" && "p-8",
          className
        )}
        {...props}
      />
    )
  }
)
SectionCard.displayName = "SectionCard"

export { SectionCard }
