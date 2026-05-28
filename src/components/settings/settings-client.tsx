'use client';

import { useState } from 'react';
import { type TradingSession } from '@/lib/supabase/types';
import { createSession, updateSession, deleteSession } from '@/lib/actions/sessions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialSessions: TradingSession[];
}

export function SettingsClient({ initialSessions }: SettingsClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const result = await createSession(newName.trim());
    if (result.ok && result.data) {
      setSessions(prev => [...prev, result.data!]);
      setNewName('');
      setIsAdding(false);
      toast.success('Session created');
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(id: string) {
    if (!editingName.trim()) return;
    const result = await updateSession(id, editingName.trim());
    if (result.ok) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: editingName.trim() } : s));
      setEditingId(null);
      toast.success('Session renamed');
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteSession(id);
    if (result.ok) {
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success('Session deleted');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sessions Section */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Trading Sessions</h2>
              <p className="text-xs text-muted-foreground">Customize the session names for your trades</p>
            </div>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Session
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background/40 border border-border/40 hover:border-border/70 transition-all group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              {editingId === session.id ? (
                <form
                  className="flex-1 flex items-center gap-2"
                  onSubmit={(e) => { e.preventDefault(); handleEdit(session.id); }}
                >
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-7 text-sm bg-background/50 flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-profit hover:text-profit">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{session.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => { setEditingId(session.id); setEditingName(session.name); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Inline Add Row */}
          {isAdding && (
            <form
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/5"
              onSubmit={handleCreate}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Frankfurt Pre-Market"
                className="h-7 text-sm bg-background/50 flex-1"
                autoFocus
              />
              <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-profit hover:text-profit" disabled={!newName.trim()}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => { setIsAdding(false); setNewName(''); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </form>
          )}

          {sessions.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No sessions yet. Add one above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
