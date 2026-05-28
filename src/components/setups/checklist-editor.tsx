'use client';

import { useState } from 'react';
import { type ChecklistItem } from '@/lib/supabase/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Pencil, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onReorder: (items: ChecklistItem[]) => void;
  onUpdateItem: (id: string, content: string) => void;
  onDeleteItem: (id: string) => void;
}

export function ChecklistEditor({
  items,
  onReorder,
  onUpdateItem,
  onDeleteItem,
}: ChecklistEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      position: idx,
    }));
    onReorder(reordered);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          No checklist conditions yet. Add one below.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <SortableChecklistItem
              key={item.id}
              item={item}
              index={idx}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableChecklistItem({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: ChecklistItem;
  index: number;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleSaveEdit() {
    if (editValue.trim() && editValue.trim() !== item.content) {
      onUpdate(item.id, editValue.trim());
    }
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 rounded-lg px-2 py-2 bg-background/30
        border border-border/30 group transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:bg-background/50'}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-xs text-muted-foreground/50 w-5 shrink-0">
        {index + 1}.
      </span>

      {editing ? (
        <div className="flex-1 flex gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs bg-background/50"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSaveEdit}>
            <Check className="w-3.5 h-3.5 text-profit" />
          </Button>
        </div>
      ) : (
        <span className="flex-1 text-sm text-foreground/90">{item.content}</span>
      )}

      {!editing && (
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => {
              setEditValue(item.content);
              setEditing(true);
            }}
          >
            <Pencil className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onDelete(item.id)}
          >
            <X className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
