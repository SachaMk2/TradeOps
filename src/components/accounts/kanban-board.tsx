'use client';

import { useState } from 'react';
import { type Account, type AccountPhase } from '@/lib/supabase/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { moveAccount, createAccount } from '@/lib/actions/accounts';
import { CreateAccountDialog } from './create-account-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const PHASES: { key: AccountPhase; label: string; color: string }[] = [
  { key: 'eval_p1', label: 'Eval P1', color: '#6366f1' },
  { key: 'eval_p2', label: 'Eval P2', color: '#8b5cf6' },
  { key: 'funded', label: 'Funded', color: '#22c55e' },
  { key: 'passed', label: 'Passed', color: '#06b6d4' },
  { key: 'failed', label: 'Failed', color: '#ef4444' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

interface KanbanBoardProps {
  initialAccounts: Account[];
}

export function KanbanBoard({ initialAccounts }: KanbanBoardProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeAccount = activeId ? accounts.find((a) => a.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const accountId = active.id as string;
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;

    // Determine target phase from the droppable column
    const targetPhase = over.id as AccountPhase;
    if (!PHASES.find((p) => p.key === targetPhase)) return;

    if (account.phase === targetPhase) return;

    // Optimistic update
    const prevAccounts = [...accounts];
    const phaseAccounts = accounts.filter((a) => a.phase === targetPhase);
    const newPosition = phaseAccounts.length;

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              phase: targetPhase,
              position: newPosition,
              funded_at: targetPhase === 'funded' ? new Date().toISOString() : a.funded_at,
              failed_at: targetPhase === 'failed' ? new Date().toISOString() : a.failed_at,
            }
          : a
      )
    );

    const result = await moveAccount(accountId, targetPhase, newPosition);
    if (!result.ok) {
      setAccounts(prevAccounts);
      toast.error('Failed to move account: ' + result.error);
    } else {
      toast.success(`Moved to ${PHASES.find((p) => p.key === targetPhase)?.label}`);
    }
  }

  function handleCreated(account: Account) {
    setAccounts((prev) => [...prev, account]);
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setCreateOpen(true)} className="gap-2" size="sm">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-3 min-h-[600px]">
          {PHASES.map((phase) => {
            const phaseAccounts = accounts
              .filter((a) => a.phase === phase.key)
              .sort((a, b) => a.position - b.position);

            return (
              <KanbanColumn
                key={phase.key}
                phase={phase}
                accounts={phaseAccounts}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeAccount && (
            <AccountCard account={activeAccount} isDragOverlay />
          )}
        </DragOverlay>
      </DndContext>

      <CreateAccountDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  );
}

function KanbanColumn({
  phase,
  accounts,
}: {
  phase: { key: AccountPhase; label: string; color: string };
  accounts: Account[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: phase.key });

  const totalFees = accounts.reduce((sum, a) => sum + Number(a.challenge_fee), 0);

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border border-border/50 bg-card/30 p-3
        flex flex-col transition-all duration-200
        ${isOver ? 'border-primary/50 bg-primary/5' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase.color }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
          {phase.label}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">{accounts.length}</span>
      </div>

      {totalFees > 0 && (
        <div className="text-xs text-muted-foreground px-1 mb-2">
          Fees: {formatCurrency(totalFees)}
        </div>
      )}

      {/* Cards */}
      <SortableContext items={accounts.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[100px]">
          {accounts.map((account) => (
            <SortableAccountCard key={account.id} account={account} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableAccountCard({ account }: { account: Account }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AccountCard account={account} isDragging={isDragging} />
    </div>
  );
}

function AccountCard({
  account,
  isDragging = false,
  isDragOverlay = false,
}: {
  account: Account;
  isDragging?: boolean;
  isDragOverlay?: boolean;
}) {
  return (
    <div
      className={`
        glass rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'opacity-30' : ''}
        ${isDragOverlay ? 'shadow-2xl scale-105 rotate-2' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground truncate">
          {account.provider_name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(account.account_size)}
        </span>
      </div>
      {account.nickname && (
        <p className="text-xs text-muted-foreground truncate mb-2">{account.nickname}</p>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Fee: {formatCurrency(account.challenge_fee)}
        </span>
      </div>
    </div>
  );
}
