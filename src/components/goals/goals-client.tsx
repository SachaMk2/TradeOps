'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Loader2, Plus, Target, CheckCircle2, Circle, Clock, Trash2, XCircle } from 'lucide-react';
import { type Goal } from '@/lib/supabase/types';
import { createGoal, updateGoal, deleteGoal } from '@/lib/actions/goals';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function GoalsClient({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const result = await createGoal({
      title: title.trim(),
      description: description.trim() || null,
      status: 'active',
      target_date: targetDate ? new Date(targetDate).toISOString() : null,
    });

    setLoading(false);
    if (result.ok) {
      toast.success('Goal created');
      setOpen(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: Goal['status']) {
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    const result = await updateGoal(id, { status: newStatus });
    if (result.ok) {
      toast.success(`Goal marked as ${newStatus}`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleAbandon(id: string) {
    if (!confirm('Are you sure you want to abandon this goal?')) return;
    const result = await updateGoal(id, { status: 'abandoned' });
    if (result.ok) {
      toast.success('Goal abandoned');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to completely delete this goal?')) return;
    const result = await deleteGoal(id);
    if (result.ok) {
      toast.success('Goal deleted');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const abandonedGoals = goals.filter((g) => g.status === 'abandoned');

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Goal
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                  placeholder="e.g. Pass FTMO Challenge"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 resize-none"
                  placeholder="Details on how to achieve this..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Active Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Active Goals
            </h2>
            <Badge variant="secondary">{activeGoals.length}</Badge>
          </div>
          <div className="space-y-3">
            {activeGoals.map((g) => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onToggle={() => handleToggleStatus(g.id, g.status)}
                onAbandon={() => handleAbandon(g.id)}
                onDelete={() => handleDelete(g.id)}
              />
            ))}
            {activeGoals.length === 0 && (
              <div className="p-6 border border-dashed border-border/50 rounded-xl text-center text-muted-foreground text-sm">
                No active goals. Time to set one!
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-profit" /> Completed
            </h2>
            <Badge variant="secondary">{completedGoals.length}</Badge>
          </div>
          <div className="space-y-3">
            {completedGoals.map((g) => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onToggle={() => handleToggleStatus(g.id, g.status)}
                onDelete={() => handleDelete(g.id)}
              />
            ))}
            {completedGoals.length === 0 && (
              <div className="p-6 border border-dashed border-border/50 rounded-xl text-center text-muted-foreground text-sm">
                No completed goals yet.
              </div>
            )}
          </div>
        </div>

        {/* Abandoned Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-4 h-4 text-muted-foreground" /> Abandoned
            </h2>
            <Badge variant="secondary" className="opacity-50">{abandonedGoals.length}</Badge>
          </div>
          <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
            {abandonedGoals.map((g) => (
              <GoalCard 
                key={g.id} 
                goal={g} 
                onDelete={() => handleDelete(g.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ 
  goal, 
  onToggle, 
  onAbandon, 
  onDelete 
}: { 
  goal: Goal; 
  onToggle?: () => void;
  onAbandon?: () => void;
  onDelete: () => void;
}) {
  const isCompleted = goal.status === 'completed';
  const isAbandoned = goal.status === 'abandoned';
  
  let targetNode = null;
  if (goal.target_date && !isCompleted && !isAbandoned) {
    const isLate = isPast(new Date(goal.target_date));
    targetNode = (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${isLate ? 'text-loss' : 'text-muted-foreground'}`}>
        <Clock className="w-3 h-3" />
        {isLate ? 'Overdue' : 'Due'} {formatDistanceToNow(new Date(goal.target_date), { addSuffix: true })}
      </div>
    );
  } else if (isCompleted && goal.completed_at) {
    targetNode = (
      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-profit/80">
        <CheckCircle2 className="w-3 h-3" />
        Completed on {format(new Date(goal.completed_at), 'MMM dd, yyyy')}
      </div>
    );
  }

  return (
    <div className={`
      relative group p-4 rounded-xl border transition-all duration-200
      ${isCompleted ? 'bg-profit/5 border-profit/20' : isAbandoned ? 'bg-muted/10 border-border/20' : 'bg-card border-border hover:border-primary/30'}
    `}>
      <div className="flex items-start gap-3">
        {onToggle && (
          <button 
            onClick={onToggle}
            className={`mt-0.5 shrink-0 ${isCompleted ? 'text-profit' : 'text-muted-foreground hover:text-primary'}`}
          >
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm ${isCompleted || isAbandoned ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {goal.description}
            </p>
          )}
          {targetNode}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {onAbandon && !isCompleted && !isAbandoned && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-warning" onClick={onAbandon} title="Abandon">
            <XCircle className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete} title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
