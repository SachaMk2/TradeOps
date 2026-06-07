'use client';

import { useState, useEffect } from 'react';
import { type Account } from '@/lib/supabase/types';
import { updateAccount } from '@/lib/actions/accounts';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass border-l-border/50 sm:max-w-[425px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Account</SheetTitle>
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
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
