'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type TradeWithRelations, type TradeChecklistItem } from '@/lib/supabase/types';
import { updateTradeChecklistItem, deleteTrade } from '@/lib/actions/trades';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

interface TradeDetailSheetProps {
  trade: TradeWithRelations | null;
  onClose: () => void;
}

export function TradeDetailSheet({ trade, onClose }: TradeDetailSheetProps) {
  const router = useRouter();
  const [checklistItems, setChecklistItems] = useState<TradeChecklistItem[]>([]);
  const [adherence, setAdherence] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Sync when trade changes
  const tradeId = trade?.id;
  const [prevId, setPrevId] = useState<string | null>(null);
  if (tradeId && tradeId !== prevId) {
    setPrevId(tradeId);
    const items = (trade!.trade_checklist_items ?? []).sort((a, b) => a.position - b.position);
    setChecklistItems(items);
    setAdherence(Number(trade!.adherence_pct));
  }

  async function handleDelete() {
    if (!trade) return;
    
    const firstConfirm = window.confirm('Are you sure you want to delete this trade?');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('This will permanently delete the trade, all its executions, and checklist snapshots. THIS CANNOT BE UNDONE. Are you absolutely sure?');
    if (!secondConfirm) return;

    setDeleting(true);
    const result = await deleteTrade(trade.id);
    setDeleting(false);

    if (result.ok) {
      toast.success('Trade deleted successfully');
      onClose();
      router.refresh();
    } else {
      toast.error('Failed to delete trade: ' + result.error);
    }
  }

  async function handleToggleItem(item: TradeChecklistItem) {
    if (!trade) return;

    const newValue = !item.is_respected;

    // Optimistic update
    const updated = checklistItems.map((i) =>
      i.id === item.id ? { ...i, is_respected: newValue } : i
    );
    setChecklistItems(updated);

    const respectedCount = updated.filter((i) => i.is_respected).length;
    const newAdherence = updated.length > 0 ? Math.round((respectedCount / updated.length) * 100) : 100;
    setAdherence(newAdherence);

    const result = await updateTradeChecklistItem(item.id, newValue, trade.id);
    if (!result.ok) {
      // Rollback
      setChecklistItems(checklistItems);
      setAdherence(Number(trade.adherence_pct));
      toast.error('Failed to update checklist');
    }
  }

  if (!trade) return null;

  const pnl = Number((trade as any).pnl_currency);
  const pnlR = trade.pnl_r ? Number(trade.pnl_r) : null;

  return (
    <Sheet open={!!trade} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[520px] sm:max-w-[520px] bg-card border-border/50 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="font-bold text-lg">{trade.instrument}</span>
            {trade.direction === 'long' ? (
              <Badge className="bg-profit/20 text-profit border-profit/30">
                <TrendingUp className="w-3 h-3 mr-1" /> Long
              </Badge>
            ) : (
              <Badge className="bg-loss/20 text-loss border-loss/30">
                <TrendingDown className="w-3 h-3 mr-1" /> Short
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {trade.status}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* P&L Hero */}
          <div className={`rounded-xl p-4 text-center ${pnl >= 0 ? 'bg-profit/5 border border-profit/20' : 'bg-loss/5 border border-loss/20'}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">P&L</p>
            <p className={`text-3xl font-bold tracking-tight ${pnl >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss'}`}>
              {formatCurrency(pnl)}
            </p>
            {pnlR !== null && (
              <p className={`text-sm mt-1 font-medium ${pnlR >= 0 ? 'text-profit/80 text-glow-profit' : 'text-loss/80 text-glow-loss'}`}>
                {pnlR.toFixed(2)}R
              </p>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-border/50 hover:bg-muted/50 h-9 text-xs font-semibold"
              onClick={() => router.push(`/trades/${trade.id}/edit`)}
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              Edit Trade
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 h-9 text-xs font-semibold"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete Trade
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailItem icon={Clock} label="Date" value={format(new Date(trade.entry_time || trade.created_at), 'MMM dd yyyy, HH:mm')} />
            <DetailItem icon={Target} label="Session" value={trade.session?.name ?? '—'} />
          </div>

          {/* Emotional State */}
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Emotional State:</span>
            <Badge variant="outline" className="capitalize">{trade.emotional_state}</Badge>
          </div>

          <Separator />

          {/* Frozen Checklist */}
          {checklistItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Checklist Snapshot
                </h4>
                <span className={`text-xs font-bold ${adherence >= 80 ? 'text-profit' : adherence >= 50 ? 'text-warning' : 'text-loss'}`}>
                  {adherence}% adherence
                </span>
              </div>

              <div className="space-y-1.5">
                {checklistItems.map((item) => (
                  <label
                    key={item.id}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all
                      ${item.is_respected ? 'bg-profit/5 border border-profit/15' : 'bg-loss/5 border border-loss/15'}
                    `}
                  >
                    <Checkbox
                      checked={item.is_respected}
                      onCheckedChange={() => handleToggleItem(item)}
                    />
                    <span className={`text-sm ${!item.is_respected ? 'line-through text-muted-foreground' : ''}`}>
                      {item.content}
                    </span>
                  </label>
                ))}
              </div>

              <Separator className="mt-4" />
            </div>
          )}

          {/* Mistakes */}
          {trade.mistake_tags && trade.mistake_tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-loss" />
                Mistakes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {trade.mistake_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-loss/30 text-loss/90 text-xs">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {trade.notes}
              </p>
            </div>
          )}

          {/* Screenshots */}
          {trade.screenshot_urls && trade.screenshot_urls.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Screenshots
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {trade.screenshot_urls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background/30 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
