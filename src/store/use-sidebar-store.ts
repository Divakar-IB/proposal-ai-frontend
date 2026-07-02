import { create } from "zustand";
import { FileText, BookOpen, FolderOpen, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarStore {
  navItems: NavItem[];
  activeHref: string;
  isCollapsed: boolean;
  setActiveHref: (href: string) => void;
  toggleSidebar: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/all-proposals", label: "All Proposals", icon: FileText },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/kb-categories", label: "Document Categories", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const useSidebarStore = create<SidebarStore>((set) => ({
  navItems: NAV_ITEMS,
  activeHref: NAV_ITEMS[0].href,
  isCollapsed: false,

  setActiveHref: (href) => set({ activeHref: href }),
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
