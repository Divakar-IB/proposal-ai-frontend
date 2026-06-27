import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return (
    <div className={cn("bg-linear-to-br from-white to-gray-50 border border-white/70 shadow-xs rounded-xl", className)}>
      {children}
    </div>
  );
};
