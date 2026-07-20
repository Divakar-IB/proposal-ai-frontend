"use client";

import { BookOpen, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { useAuth } from "@/providers";

export const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-4 border-border bg-white shadow-xs shrink-0 z-10">
      <span className="text-muted-foreground font-medium font-mono text-base">
        InnoBoon Enterprise
      </span>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/knowledge-base">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </Link>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-md">
                <span className="text-white text-xs font-semibold">AS</span>
              </div>
              <span className="text-sm font-medium text-foreground">Adhi S</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1 gap-0">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
            >
              <UserRound className="w-4 h-4 text-muted-foreground" />
              Profile
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
