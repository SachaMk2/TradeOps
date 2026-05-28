'use client';

import { type SetupWithChecklist } from '@/lib/supabase/types';
import { CheckCircle, ListChecks } from 'lucide-react';

interface SetupCardProps {
  setup: SetupWithChecklist;
  onClick: () => void;
}

export function SetupCard({ setup, onClick }: SetupCardProps) {
  const checklistCount = setup.checklist_items?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-5 text-left w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group"
    >
      {/* Color bar */}
      <div
        className="w-full h-1 rounded-full mb-4"
        style={{ backgroundColor: setup.color_code }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {setup.name}
          </h3>
          {setup.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {setup.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListChecks className="w-3.5 h-3.5" />
          <span>{checklistCount} items</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>0 trades</span>
        </div>
      </div>
    </button>
  );
}
