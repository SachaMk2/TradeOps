'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, Plus, DollarSign, Calendar, Percent } from 'lucide-react';
import { type Account, type Payout } from '@/lib/supabase/types';
import { createPayout, deletePayout } from '@/lib/actions/accounts';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function PayoutsClient({
  accounts,
  payouts,
}: {
  accounts: Account[];
  payouts: Payout[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [splitPercentage, setSplitPercentage] = useState('80');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !splitPercentage || !payoutDate) return;

    setLoading(true);
    const result = await createPayout({
      account_id: accountId === 'none' || !accountId ? null : accountId,
      amount: parseFloat(amount),
      split_percentage: parseInt(splitPercentage, 10),
      payout_date: new Date(payoutDate).toISOString(),
      notes,
    });

    setLoading(false);
    if (result.ok) {
      toast.success('Payout logged successfully');
      setOpen(false);
      // Reset form
      setAccountId('');
      setAmount('');
      setSplitPercentage('80');
      setNotes('');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this payout?')) return;
    const result = await deletePayout(id);
    if (result.ok) {
      toast.success('Payout deleted');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const fundedAccounts = accounts.filter((a) => a.phase === 'funded' || a.phase === 'passed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">
          Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
            payouts.reduce((sum, p) => sum + Number(p.amount), 0)
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Log Payout
            </Button>
          } />
          <SheetContent className="glass border-l-border/50 sm:max-w-[425px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Log New Payout</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Account (Optional)</Label>
                <Select value={accountId} onValueChange={(v) => setAccountId(v || 'none')}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fundedAccounts.length === 0 ? (
                      <SelectItem value="none">No funded accounts available</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="none">None</SelectItem>
                        {fundedAccounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nickname || a.provider_name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-background/50"
                    placeholder="2500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Split (%)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={splitPercentage}
                    onChange={(e) => setSplitPercentage(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payout Date</Label>
                <Input
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background/50 resize-none"
                  rows={3}
                />
              </div>
              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Payout
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-border/50">
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No payouts logged yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Split</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {payouts.map((p) => {
                const acc = accounts.find((a) => a.id === p.account_id);
                return (
                  <tr key={p.id} className="group hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {format(new Date(p.payout_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {acc ? (acc.nickname || acc.provider_name) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">
                      {p.split_percentage}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-profit text-glow-profit">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(p.amount))}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[300px]">
                      {p.notes}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity h-8"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
