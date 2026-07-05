import React from "react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  title: string;
  excerpt: string;
  tag: string;
  timestamp: string;
  active?: boolean;
  onClick?: () => void;
}

export function NoteCard({ title, excerpt, tag, timestamp, active, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors group border-b border-outline-variant/10",
        active
          ? "bg-primary-container/10 border-l-2 border-primary"
          : "border-l-2 border-transparent hover:bg-surface-container-high"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h3
          className={cn(
            "text-xs font-semibold tracking-wide uppercase truncate pr-4",
            active ? "text-primary" : "text-on-surface"
          )}
        >
          {title}
        </h3>
        <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">
          {timestamp}
        </span>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-2">
        {excerpt}
      </p>
      <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-[10px] text-on-surface-variant">
        {tag}
      </span>
    </div>
  );
}
