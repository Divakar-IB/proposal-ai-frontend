"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useSidebarStore } from "@/store/use-sidebar-store";

export const Header = () => {
  const pathname = usePathname();
  const { navItems } = useSidebarStore();

  const currentNav = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const title = currentNav?.label ?? "Dashboard";

  return (
    <header className="flex items-center justify-between px-8 py-4 border-border bg-white shadow-xs shrink-0 z-10">
      {/* Left — org + page title */}
      <div className="flex items-center gap-2 text-base">
        <span className="text-muted-foreground font-medium font-mono">
          InnoBoon Enterprise
        </span>
        <span className="w-px h-4 bg-border" />
        <span className="text-foreground font-semibold">{title}</span>
      </div>

      {/* Right — actions + avatar */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          <BookOpen className="w-4 h-4" />
          Knowledge Base
        </Button>

        <Button size="sm">
          <Plus className="w-4 h-4" />
          New Proposal
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white text-xs font-semibold">AS</span>
          </div>
          <span className="text-sm font-medium text-foreground">Adhi S</span>
        </div>
      </div>
    </header>
  );
};
