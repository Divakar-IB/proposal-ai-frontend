"use client";

import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-border bg-white shadow-xs shrink-0 z-10">
      <span className="text-muted-foreground font-medium font-mono text-base">
        InnoBoon Enterprise
      </span>

      {/* Right — actions + avatar */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/knowledge-base">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </Link>
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
