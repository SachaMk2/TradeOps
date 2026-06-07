'use client';

import { useState, useEffect } from 'react';
import { type Account } from '@/lib/supabase/types';
import { updateAccount } from '@/lib/actions/accounts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onUpdated: (account: Account) => void;
}

export function EditAccountDialog({ open, onOpenChange, account, onUpdated }: EditAccountDialogProps) {
  const [providerName, setProviderName] = useState('');
  const [nickname, setNickname] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [challengeFee, setChallengeFee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setProviderName(account.provider_name);
      setNickname(account.nickname || '');
      setAccountSize(account.account_size.toString());
      setChallengeFee(account.challenge_fee.toString());
    }
  }, [account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    setLoading(true);

    const result = await updateAccount(account.id, {
      provider_name: providerName.trim(),
      nickname: nickname.trim() || null,
      account_size: parseFloat(accountSize) || 0,
      challenge_fee: parseFloat(challengeFee) || 0,
    });

    if (result.ok) {
      onUpdated(result.data);
      onOpenChange(false);
      toast.success('Account updated');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !providerName.trim()}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
