'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { type SetupWithChecklist } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { SetupCard } from './setup-card';
import { CreateSetupDialog } from './create-setup-dialog';
import { SetupDetailSheet } from './setup-detail-sheet';

interface SetupsPageClientProps {
  initialSetups: SetupWithChecklist[];
}

export function SetupsPageClient({ initialSetups }: SetupsPageClientProps) {
  const [setups, setSetups] = useState(initialSetups);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<SetupWithChecklist | null>(null);

  const activeSetups = setups.filter((s) => !s.is_archived);
  const archivedSetups = setups.filter((s) => s.is_archived);

  function handleCreated(setup: SetupWithChecklist) {
    setSetups((prev) => [setup, ...prev]);
  }

  function handleUpdated(updated: SetupWithChecklist) {
    setSetups((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    if (selectedSetup?.id === updated.id) {
      setSelectedSetup(updated);
    }
  }

  function handleDeleted(id: string) {
    setSetups((prev) => prev.filter((s) => s.id !== id));
    if (selectedSetup?.id === id) {
      setSelectedSetup(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Setup
        </Button>
        {archivedSetups.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {archivedSetups.length} archived
          </span>
        )}
      </div>

      {activeSetups.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No setups yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first trading playbook to get started.
          </p>
          <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Setup
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeSetups.map((setup) => (
            <SetupCard
              key={setup.id}
              setup={setup}
              onClick={() => setSelectedSetup(setup)}
            />
          ))}
        </div>
      )}

      <CreateSetupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <SetupDetailSheet
        setup={selectedSetup}
        onClose={() => setSelectedSetup(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </>
  );
}
