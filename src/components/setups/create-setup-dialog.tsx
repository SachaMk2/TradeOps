'use client';

import { useState } from 'react';
import { createSetup } from '@/lib/actions/setups';
import { type SetupWithChecklist } from '@/lib/supabase/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  '#3b82f6', '#2563eb', '#60a5fa', '#0ea5e9', '#0284c7',
  '#6366f1', '#4f46e5', '#818cf8', '#0d9488', '#14b8a6',
];

interface CreateSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (setup: SetupWithChecklist) => void;
}

export function CreateSetupDialog({ open, onOpenChange, onCreated }: CreateSetupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await createSetup(name.trim(), description.trim(), color);

    if (result.ok) {
      onCreated({ ...result.data, checklist_items: [] });
      onOpenChange(false);
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      toast.success('Setup created');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass border-l-border/50 sm:max-w-[425px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Create Setup</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="setup-name">Name</Label>
            <Input
              id="setup-name"
              placeholder="e.g., ICT Silver Bullet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-desc">Description</Label>
            <Textarea
              id="setup-desc"
              placeholder="Describe when and how you enter this setup..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-background/50 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-200 ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Setup
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
