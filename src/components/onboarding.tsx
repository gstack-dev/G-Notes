import React, { useState, useEffect } from "react";
import { X, PenSquare, Search, Tags, Star } from "lucide-react";

const STEPS = [
  {
    icon: PenSquare,
    title: "Create Notes",
    description: "Click the + button or press Cmd+N to create a new note. Write with rich text, headings, lists, and more.",
  },
  {
    icon: Search,
    title: "Search Everything",
    description: "Press Cmd+Shift+F to search across all your note titles and content. Full-text search finds what you need instantly.",
  },
  {
    icon: Tags,
    title: "Organize with Categories",
    description: "Tag notes with categories like Work, Code, or Personal. Filter by category to focus on what matters.",
  },
  {
    icon: Star,
    title: "Stay Offline",
    description: "All your notes are stored locally in SQLite. Nothing leaves your machine. No account needed.",
  },
];

export function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key === "Enter" || e.key === "ArrowRight") {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else onDismiss();
      }
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onDismiss]);

  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90vw] max-w-md rounded-2xl bg-surface border border-outline-variant shadow-2xl p-8 text-center">
        <button onClick={onDismiss} className="absolute top-4 right-4 p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Icon className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-xl font-heading font-semibold text-on-surface mb-2">{s.title}</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-8">{s.description}</p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-1.5 bg-outline-variant/40"}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 px-4 py-2 rounded-xl border border-outline-variant/50 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
              Back
            </button>
          )}
          <button
            onClick={() => { if (step < STEPS.length - 1) setStep((s) => s + 1); else onDismiss(); }}
            className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {step < STEPS.length - 1 ? "Next" : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}
