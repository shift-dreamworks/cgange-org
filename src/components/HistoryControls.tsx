import React from 'react';
import { Button } from './ui/button';
import { Undo, Redo } from 'lucide-react';

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function HistoryControls({ canUndo, canRedo, onUndo, onRedo }: HistoryControlsProps) {
  return (
    <div className="flex space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        title="元に戻す"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        title="やり直し"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
