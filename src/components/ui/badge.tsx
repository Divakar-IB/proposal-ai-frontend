import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-muted text-muted-foreground border border-border",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger:  "bg-red-50 text-red-700 border border-red-200",
  info:    "bg-blue-50 text-blue-700 border border-blue-200",
  purple:  "bg-primary/10 text-primary border border-primary/20",
} as const;

type BadgeVariant = keyof typeof VARIANTS;

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ children, variant = "default", className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
      VARIANTS[variant],
      className,
    )}
  >
    {children}
  </span>
);
