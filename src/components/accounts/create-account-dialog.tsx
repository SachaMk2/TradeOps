'use client';

import { useState } from 'react';
import { type Account, type AccountPhase } from '@/lib/supabase/types';
import { createAccount } from '@/lib/actions/accounts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Prop Firm</Label>
            <Input
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g., FTMO, TFT, MyFundedFX"
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Nickname</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., FTMO 100K #2"
              className="bg-background/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Account Size</Label>
              <Input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                placeholder="100000"
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Challenge Fee</Label>
              <Input
                type="number"
                value={challengeFee}
                onChange={(e) => setChallengeFee(e.target.value)}
                placeholder="500"
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Starting Phase</Label>
            <Select value={phase} onValueChange={(v) => v && setPhase(v as AccountPhase)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eval_p1">Eval P1</SelectItem>
                <SelectItem value="eval_p2">Eval P2</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !providerName.trim()}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Add Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
