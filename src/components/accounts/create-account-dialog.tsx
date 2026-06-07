'use client';

import { useState } from 'react';
import { type Account, type AccountPhase } from '@/lib/supabase/types';
import { createAccount } from '@/lib/actions/accounts';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (account: Account) => void;
}

export function CreateAccountDialog({ open, onOpenChange, onCreated }: CreateAccountDialogProps) {
  const [providerName, setProviderName] = useState('');
  const [nickname, setNickname] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [challengeFee, setChallengeFee] = useState('');
  const [phase, setPhase] = useState<AccountPhase>('eval_p1');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createAccount({
      provider_name: providerName.trim(),
      nickname: nickname.trim() || undefined,
      account_size: parseFloat(accountSize) || 0,
      challenge_fee: parseFloat(challengeFee) || 0,
      phase,
    });

    if (result.ok) {
      onCreated(result.data);
      onOpenChange(false);
      setProviderName('');
      setNickname('');
      setAccountSize('');
      setChallengeFee('');
      setPhase('eval_p1');
      toast.success('Account added');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass border-l-border/50 sm:max-w-[425px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add Account</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Provider Name</Label>
            <Input required placeholder="e.g. FTMO, MyForexFunds" value={providerName} onChange={(e) => setProviderName(e.target.value)} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Nickname (Optional)</Label>
            <Input placeholder="e.g. Aggressive 100k" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Size ($)</Label>
              <Input required type="number" min="0" step="1000" placeholder="100000" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Challenge Fee ($)</Label>
              <Input required type="number" min="0" step="1" placeholder="540" value={challengeFee} onChange={(e) => setChallengeFee(e.target.value)} className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Initial Phase</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as AccountPhase)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eval_p1">Evaluation Phase 1</SelectItem>
                <SelectItem value="eval_p2">Evaluation Phase 2</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
