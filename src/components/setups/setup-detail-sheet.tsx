'use client';

import { useState } from 'react';
import { type SetupWithChecklist, type ChecklistItem } from '@/lib/supabase/types';
import {
  updateSetup,
  deleteSetup,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from '@/lib/actions/setups';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChecklistEditor } from './checklist-editor';
import {
  Trash2,
  Archive,
  ArchiveRestore,
  Loader2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface SetupDetailSheetProps {
  setup: SetupWithChecklist | null;
  onClose: () => void;
  onUpdated: (setup: SetupWithChecklist) => void;
  onDeleted: (id: string) => void;
}

export function SetupDetailSheet({ setup, onClose, onUpdated, onDeleted }: SetupDetailSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newItemContent, setNewItemContent] = useState('');

  // Sync local state when setup changes
  const setupId = setup?.id;
  const [prevId, setPrevId] = useState<string | null>(null);
  if (setupId && setupId !== prevId) {
    setPrevId(setupId);
    setName(setup!.name);
    setDescription(setup!.description);
    setItems(setup!.checklist_items);
  }

  async function handleSave() {
    if (!setup) return;
    setSaving(true);

    const result = await updateSetup(setup.id, {
      name: name.trim(),
      description: description.trim(),
    });

    if (result.ok) {
      onUpdated({ ...result.data, checklist_items: items });
      toast.success('Setup saved');
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  }

  async function handleArchiveToggle() {
    if (!setup) return;
    const result = await updateSetup(setup.id, { is_archived: !setup.is_archived });
    if (result.ok) {
      onUpdated({ ...result.data, checklist_items: items });
      toast.success(setup.is_archived ? 'Setup restored' : 'Setup archived');
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!setup) return;
    if (!confirm('Delete this setup permanently? This cannot be undone.')) return;

    setDeleting(true);
    const result = await deleteSetup(setup.id);
    if (result.ok) {
      onDeleted(setup.id);
      onClose();
      toast.success('Setup deleted');
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  async function handleAddItem() {
    if (!setup || !newItemContent.trim()) return;

    const position = items.length;
    const result = await addChecklistItem(setup.id, newItemContent.trim(), position);
    if (result.ok) {
      const updated = [...items, result.data];
      setItems(updated);
      onUpdated({ ...setup, name, description, checklist_items: updated });
      setNewItemContent('');
    } else {
      toast.error(result.error);
    }
  }

  async function handleUpdateItem(id: string, content: string) {
    const result = await updateChecklistItem(id, content);
    if (result.ok) {
      const updated = items.map((i) => (i.id === id ? { ...i, content } : i));
      setItems(updated);
      onUpdated({ ...setup!, name, description, checklist_items: updated });
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteItem(id: string) {
    const result = await deleteChecklistItem(id);
    if (result.ok) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      onUpdated({ ...setup!, name, description, checklist_items: updated });
    } else {
      toast.error(result.error);
    }
  }

  async function handleReorder(reorderedItems: ChecklistItem[]) {
    setItems(reorderedItems);
    const reorderData = reorderedItems.map((item, idx) => ({
      id: item.id,
      position: idx,
    }));
    const result = await reorderChecklistItems(reorderData);
    if (result.ok) {
      onUpdated({ ...setup!, name, description, checklist_items: reorderedItems });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={!!setup} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] bg-card border-border/50 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            {setup && (
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: setup.color_code }}
              />
            )}
            Edit Setup
          </SheetTitle>
        </SheetHeader>

        {setup && (
          <div className="space-y-6 mt-6">
            {/* Name & Description */}
            <div className="space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Setup name"
                className="bg-background/50 text-lg font-semibold"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this setup..."
                rows={3}
                className="bg-background/50 resize-none"
              />
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
            </div>

            <Separator />

            {/* Checklist */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                Entry Checklist
              </h4>

              <ChecklistEditor
                items={items}
                onReorder={handleReorder}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
              />

              {/* Add new item */}
              <div className="flex gap-2 mt-3">
                <Input
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Add checklist condition..."
                  className="bg-background/50 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                />
                <Button
                  onClick={handleAddItem}
                  size="sm"
                  variant="outline"
                  disabled={!newItemContent.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            {/* Stats placeholder */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                Performance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Trades', value: '0' },
                  { label: 'Win Rate', value: '—' },
                  { label: 'Avg R', value: '—' },
                  { label: 'Adherence', value: '—' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleArchiveToggle}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {setup.is_archived ? (
                  <ArchiveRestore className="w-3.5 h-3.5" />
                ) : (
                  <Archive className="w-3.5 h-3.5" />
                )}
                {setup.is_archived ? 'Restore' : 'Archive'}
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
