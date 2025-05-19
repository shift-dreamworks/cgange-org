import React from 'react';
import { Button } from './ui/button';
import { Edit, Trash, X } from 'lucide-react';

interface SelectionControlsProps {
  selectedCount: number;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export function SelectionControls({
  selectedCount,
  onBulkEdit,
  onBulkDelete,
  onClearSelection,
}: SelectionControlsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-md py-1 px-2 shadow-md">
      <span className="text-sm">{selectedCount}個選択中</span>
      <Button variant="ghost" size="sm" onClick={onBulkEdit} title="一括編集">
        <Edit className="h-4 w-4 mr-1" />
        編集
      </Button>
      <Button variant="ghost" size="sm" onClick={onBulkDelete} className="text-red-500" title="一括削除">
        <Trash className="h-4 w-4 mr-1" />
        削除
      </Button>
      <Button variant="ghost" size="sm" onClick={onClearSelection} title="選択解除">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
