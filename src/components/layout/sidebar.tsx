"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useAuth } from "@/providers";
import { UserRole } from "@/types";
import ProposalStepsSidebar from "./proposal-steps-sidebar";

const Sidebar = () => {
  const pathname = usePathname();
  const { navItems, isCollapsed, setActiveHref, toggleSidebar } = useSidebarStore();
  const { role } = useAuth();
  const isWizardMode = pathname.startsWith("/all-proposals/generate-proposals");

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || role === UserRole.OrgAdmin,
  );

  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname, setActiveHref]);

  return (
    <aside
      className={cn(
        "relative shrink-0 transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="bg-white border-r border-border flex flex-col min-h-screen overflow-hidden w-full">
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-border py-5 px-4",
            isCollapsed ? "justify-center" : "",
          )}
        >
          {isCollapsed ? (
            <Image
              src="/images/brand_logo_dark.png"
              alt="Proposal AI"
              width={28}
              height={28}
              className="rounded-md"
            />
          ) : (
            <BrandLogo theme="light" />
          )}
        </div>

        {isWizardMode ? (
          <>
            {/* Back to workspace */}
            <div
              className={cn(
                "px-2 py-3 border-b border-border",
                isCollapsed && "flex justify-center",
              )}
            >
              <Link
                href="/all-proposals"
                title={isCollapsed ? "Back to workspace" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                  isCollapsed ? "justify-center p-2.5" : "w-full px-3 py-2.5",
                )}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Back to workspace</span>}
              </Link>
            </div>

            {/* Proposal steps */}
            <nav className="flex-1 px-2 py-3">
              <ProposalStepsSidebar isCollapsed={isCollapsed} />
            </nav>
          </>
        ) : (
          <>
            {/* New Proposal CTA */}
            <div
              className={cn(
                "px-2 py-3 border-b border-border",
                isCollapsed ? "flex justify-center" : "",
              )}
            >
              <Link
                href="/all-proposals/generate-proposals/new"
                title={isCollapsed ? "New Proposal" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90",
                  isCollapsed ? "justify-center p-2.5" : "w-full px-3 py-2.5",
                )}
              >
                <Plus className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>New Proposal</span>}
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
              {!isCollapsed && (
                <p className="px-3 pb-1 text-sm font-medium text-text-subtle uppercase tracking-widest">
                  Workspace
                </p>
              )}
              {visibleNavItems.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      "relative flex items-center rounded-md text-sm transition-colors",
                      isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-3",
                      active
                        ? "bg-primary/10 text-primary font-medium border-r-3 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </nav>
          </>
        )}


      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-15 -right-3 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm z-20 text-muted-foreground hover:text-primary transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
