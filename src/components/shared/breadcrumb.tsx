import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
