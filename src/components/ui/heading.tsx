import { cn } from "@/lib/utils";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
  children: React.ReactNode;
}

const sizeStyles = {
  xl: "text-3xl font-bold",
  lg: "text-2xl font-semibold",
  md: "text-xl font-semibold",
  sm: "text-base font-semibold",
};

const Heading = ({ as: Tag = "h2", size = "lg", className, children }: HeadingProps) => {
  return (
    <Tag className={cn("text-foreground leading-tight", sizeStyles[size], className)}>
      {children}
    </Tag>
  );
};

export { Heading };
