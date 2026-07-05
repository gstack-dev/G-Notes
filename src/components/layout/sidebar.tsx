import React from "react";
import { cn } from "@/lib/utils";
import { usePageStore, type Page } from "@/shared/page-store";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Star,
  Plus,
} from "lucide-react";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "notes", label: "All Notes", icon: FileText },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "favorites", label: "Favorites", icon: Star },
];

interface SidebarProps {
  onNewNoteClick?: () => void;
}

export function Sidebar({ onNewNoteClick }: SidebarProps) {
  const activePage = usePageStore((s) => s.activePage);
  const setActivePage = usePageStore((s) => s.setActivePage);
  const setCategoryFilter = usePageStore((s) => s.setCategoryFilter);

  return (
    <aside className="flex flex-col w-sidebar h-full bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="px-4 py-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm">
          G
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-heading font-semibold text-on-surface">G-Notes</span>
          <span className="text-[10px] text-on-surface-variant/60 font-medium tracking-wider uppercase">G-Stack Productivity</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (item.id === "notes") setCategoryFilter(null);
              }}
              className={cn(
                "flex items-center gap-3 py-2 px-3 text-sm transition-colors text-left",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary rounded-r-md -ml-px"
                  : "text-on-surface-variant rounded-md hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "fill-current")} />
              <span className="text-xs font-semibold tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={onNewNoteClick}
          className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] text-white py-2 px-4 rounded-md text-xs font-semibold tracking-wide uppercase hover:bg-blue-600 transition-colors shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          New Note
        </button>
      </div>
    </aside>
  );
}
