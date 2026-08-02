"use client";

import { BookOpen, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { useAuth } from "@/providers";
import { orgService, authService } from "@/services";
import { UserRole } from "@/types";
import { getInitials } from "@/lib/utils";

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.OrgAdmin]: "Admin",
  [UserRole.Member]:   "Member",
};

export const Header = () => {
  const { logout, role } = useAuth();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const { data: org } = useQuery({
    queryKey: ["org-profile"],
    queryFn: () => orgService.getProfile(),
    staleTime: 5 * 60_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.getProfile(),
    staleTime: 5 * 60_000,
  });

  const displayName = profile?.full_name ?? profile?.email ?? "—";
  const initials = getInitials(profile?.full_name ?? profile?.email ?? null);

  return (
    <header className="flex items-center justify-between px-8 py-4 border-border bg-white shadow-xs shrink-0 z-10">
      <span className="text-muted-foreground font-medium font-mono text-base">
        {org?.organization_name ?? "InnoBoon Technologies"}
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
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-none">{displayName}</span>
                {mounted && role && <span className="text-xs text-muted-foreground mt-0.5">{ROLE_LABEL[role]}</span>}
              </div>
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
