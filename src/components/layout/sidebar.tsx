"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui";
import { useSidebarStore } from "@/store/use-sidebar-store";

const Sidebar = () => {
  const pathname = usePathname();
  const { navItems, isCollapsed, setActiveHref, toggleSidebar } =
    useSidebarStore();
  const router = useRouter();

  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname, setActiveHref]);

  const handleSignOut = () => router.push("/auth/login");
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

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
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

        {/* Sign out */}
        <div className="px-2 py-4 border-t border-border">
          <button
            onClick={handleSignOut}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "flex items-center w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-15 -right-3 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm z-10 text-muted-foreground hover:text-primary transition-colors"
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
