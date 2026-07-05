import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { NewNoteDialog } from "@/components/notes/new-note-dialog";
import { NewCategoryDialog } from "@/components/pages/new-category-dialog";
import { AppInit } from "@/components/app-init";
import { ErrorBoundary } from "@/components/error-boundary";
import { ToastContainer } from "@/components/toast-container";
import { AboutDialog } from "@/components/dialogs/about-dialog";
import { SettingsDialog } from "@/components/dialogs/settings-dialog";
import { ExportImportDialog } from "@/components/dialogs/export-import-dialog";
import { useMenuHandlers } from "@/shared/menu-handlers";
import { useNotesStore } from "@/shared/zust-store";
import { OnboardingOverlay } from "@/components/onboarding";

export function AppShell() {
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const showOnboarding = useNotesStore((s) => s.showOnboarding);
  const dismissOnboarding = useNotesStore((s) => s.dismissOnboarding);

  const setDialog = (key: string, open: boolean) => {
    switch (key) {
      case "newNote": setNewNoteOpen(open); break;
      case "newCategory": setNewCategoryOpen(open); break;
      case "about": setAboutOpen(open); break;
      case "settings": setSettingsOpen(open); break;
      case "exportImport": setExportImportOpen(open); break;
    }
  };

  useMenuHandlers(setDialog);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppInit />
        <Sidebar onNewNoteClick={() => setNewNoteOpen(true)} />
        <MainContent
          onNewNoteClick={() => setNewNoteOpen(true)}
          onNewCategoryClick={() => setNewCategoryOpen(true)}
        />
        <NewNoteDialog open={newNoteOpen} onOpenChange={setNewNoteOpen} />
        <NewCategoryDialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen} />
        <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <ExportImportDialog open={exportImportOpen} onOpenChange={setExportImportOpen} />
        <ToastContainer />
        {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}
      </div>
    </ErrorBoundary>
  );
}
