import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function ProBadge({ className, size = "sm" }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2 py-0.5 font-semibold text-white shadow-sm",
        size === "sm" ? "text-[10px]" : "text-xs",
        className,
      )}
      title="Pro Creator"
    >
      <Sparkles className={size === "sm" ? "size-2.5" : "size-3"} />
      PRO
    </span>
  );
}

export function FeaturedBadge({ className, size = "sm" }: ProBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700",
        size === "sm" ? "text-[10px]" : "text-xs",
        className,
      )}
      title="Featured Creator"
    >
      <Star className={cn(size === "sm" ? "size-2.5" : "size-3", "fill-amber-500 text-amber-500")} />
      FEATURED
    </span>
  );
}
