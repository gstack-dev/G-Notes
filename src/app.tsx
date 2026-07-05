import React from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const root = createRoot(document.body);
root.render(
  <ErrorBoundary>
    <AppShell />
  </ErrorBoundary>
);
