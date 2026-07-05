import React from "react";
import { cn } from "@/lib/utils";
import { usePageStore } from "@/shared/page-store";
import { Plus } from "lucide-react";
import { Dashboard } from "@/components/pages/dashboard";
import { NotesPage } from "@/components/pages/notes";
import { CategoriesPage } from "@/components/pages/categories";
import { FavoritesPage } from "@/components/pages/favorites";

const PAGE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    notes: "All Notes",
    categories: "Categories",
    favorites: "Favorites",
};

const PAGE_COMPONENTS: Record<string, React.ElementType> = {
    dashboard: Dashboard,
    notes: NotesPage,
    categories: CategoriesPage,
    favorites: FavoritesPage,
};

function PageFallback() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-on-surface-variant">Page not found.</p>
        </div>
    );
}

const PAGES_WITH_HEADER: Set<string> = new Set([
    "notes",
    "favorites",
]);

interface MainContentProps {
    onNewNoteClick?: () => void;
    onNewCategoryClick?: () => void;
}

export function MainContent({
    onNewNoteClick,
    onNewCategoryClick,
}: MainContentProps) {
    const activePage = usePageStore((s) => s.activePage);
    const PageComponent = PAGE_COMPONENTS[activePage] || PageFallback;
    const showHeader = !PAGES_WITH_HEADER.has(activePage);

    return (
        <main className="flex-1 flex flex-col h-full bg-background overflow-hidden">
            {showHeader && (
                <header className="flex items-center justify-between px-6 py-3 h-14 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
                    <h1 className="text-lg font-heading font-semibold text-on-surface">
                        {PAGE_LABELS[activePage]}
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onNewNoteClick}
                            className="flex items-center gap-1.5 bg-[#3B82F6] text-white px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Note
                        </button>
                    </div>
                </header>
            )}
            <div className={cn("flex-1 overflow-hidden")}>
                <PageComponent
                    onNewNoteClick={onNewNoteClick}
                    onNewCategoryClick={onNewCategoryClick}
                />
            </div>
        </main>
    );
}
