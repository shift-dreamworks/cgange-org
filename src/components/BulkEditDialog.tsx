import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface BulkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
  selectedCount: number;
}

export function BulkEditDialog({ isOpen, onClose, onSave, selectedCount }: BulkEditDialogProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleSave = () => {
    if (newTitle.trim()) {
      onSave(newTitle);
      setNewTitle('');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>一括編集</DialogTitle>
          <DialogDescription>
            選択された {selectedCount} 個のノードの役職を一括で編集します。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">新しい役職</Label>
            <Input
              id="title"
              placeholder="役職名"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!newTitle.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
