'use client';

import { useState } from 'react';
import { type MindDump } from '@/lib/supabase/types';
import { createMindDump, deleteMindDump } from '@/lib/actions/mind-dumps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Trash2, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MindDumpClientProps {
  initialDumps: MindDump[];
}

export function MindDumpClient({ initialDumps }: MindDumpClientProps) {
  const [dumps, setDumps] = useState<MindDump[]>(initialDumps);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [dumpDate, setDumpDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dumpDate || !content.trim()) return;

    setLoading(true);
    const result = await createMindDump({ dump_date: dumpDate, content });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error || 'Failed to save mind dump');
    } else if (result.data) {
      setDumps((prev) => [result.data!, ...prev].sort((a, b) => new Date(b.dump_date).getTime() - new Date(a.dump_date).getTime()));
      setContent('');
      toast.success('Mind dump saved');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    setDeletingId(id);
    const result = await deleteMindDump(id);
    if (!result.ok) {
      toast.error(result.error || 'Failed to delete mind dump');
    } else {
      setDumps((prev) => {
        const newDumps = prev.filter((d) => d.id !== id);
        // Adjust pagination if deleting last item on current page
        const newTotalPages = Math.ceil(newDumps.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
        return newDumps;
      });
      toast.success('Mind dump deleted');
    }
    setDeletingId(null);
  }

  // Calculate Pagination
  const totalPages = Math.ceil(dumps.length / itemsPerPage);
  const paginatedDumps = dumps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
      {/* Editor Section */}
      <div className="glass interactive-card rounded-2xl p-6 border-border/50 sticky top-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">New Entry</h2>
            <p className="text-xs text-muted-foreground">What's on your mind?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dumpDate}
                onChange={(e) => setDumpDate(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Thoughts & Notes</Label>
            <Textarea
              placeholder="The market felt slow today, I was tempted to overtrade but stopped myself..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-y bg-background/50 border-border/50 leading-relaxed"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !content.trim()}>
            {loading ? 'Saving...' : 'Save Mind Dump'}
          </Button>
        </form>
      </div>

      {/* Feed Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Past Entries</h2>
        
        {dumps.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border-dashed border-border/50">
            <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No mind dumps yet. Start emptying your head!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedDumps.map((dump) => (
              <div key={dump.id} className="glass interactive-card rounded-2xl p-6 border-border/50 group relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-foreground/90">
                      {format(new Date(dump.dump_date), 'MMMM do, yyyy')}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(dump.id)}
                    disabled={deletingId === dump.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-loss hover:bg-loss/10 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {dump.content}
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, dumps.length)}</span> of <span className="font-medium text-foreground">{dumps.length}</span> notes
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 border-border/50 bg-background/50"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 border-border/50 bg-background/50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
