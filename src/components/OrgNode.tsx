import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PencilIcon, TrashIcon, PlusIcon, XIcon, CheckIcon } from 'lucide-react';
import { Input } from './ui/input';

export interface OrgNodeData {
  name: string;
  title: string;
  level?: number;
  isEditing?: boolean;
  onDelete?: (id: string) => void;
  onAdd?: (parentId: string) => void;
  onEdit?: (id: string, name: string, title: string) => void;
}

const OrgNode = ({ id, data }: NodeProps<OrgNodeData>) => {
  const [editMode, setEditMode] = useState(false);
  const [nameValue, setNameValue] = useState(data.name);
  const [titleValue, setTitleValue] = useState(data.title);

  const getBgGradientClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gradient-to-br from-white to-blue-50 dark:from-zinc-900 dark:to-blue-950';
      case 1:
        return 'bg-gradient-to-br from-white to-teal-50 dark:from-zinc-900 dark:to-teal-950';
      case 2:
        return 'bg-gradient-to-br from-white to-green-50 dark:from-zinc-900 dark:to-green-950';
      default:
        return 'bg-gradient-to-br from-white to-emerald-50 dark:from-zinc-900 dark:to-emerald-950';
    }
  };

  const getTitleColorClass = (level: number) => {
    switch (level) {
      case 0:
        return 'text-blue-700 dark:text-blue-300';
      case 1:
        return 'text-teal-700 dark:text-teal-300';
      case 2:
        return 'text-green-700 dark:text-green-300';
      default:
        return 'text-emerald-700 dark:text-emerald-300';
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setNameValue(data.name);
    setTitleValue(data.title);
    setEditMode(false);
  };

  const handleSave = () => {
    if (data.onEdit) {
      data.onEdit(id, nameValue, titleValue);
    }
    setEditMode(false);
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleAdd = () => {
    if (data.onAdd) {
      data.onAdd(id);
    }
  };

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${data.level === 0 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-blue-500 dark:bg-blue-400'}`} />
      <Card 
        className={`min-w-[220px] p-3 shadow-lg transition-all duration-200 
                  hover:shadow-xl border-2 border-zinc-100 dark:border-zinc-800
                  ${getBgGradientClass(data.level ?? 0)}`}
      >
        {editMode ? (
          <div className="space-y-2">
            <Input
              placeholder="名前"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="mb-1"
            />
            <Input
              placeholder="役職"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <XIcon className="h-4 w-4 mr-1" />
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSave}>
                <CheckIcon className="h-4 w-4 mr-1" />
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-1">
            <div className="font-bold text-lg">{data.name}</div>
            <div className={`text-sm mt-1 ${getTitleColorClass(data.level ?? 0)}`}>{data.title}</div>
            <div className="hidden group-hover:flex absolute top-1 right-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button size="icon" variant="ghost" onClick={handleEdit} className="h-6 w-6 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                <PencilIcon className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleDelete} className="h-6 w-6 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400">
                <TrashIcon className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleAdd} className="h-6 w-6 text-zinc-500 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-400">
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${data.level === 0 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-blue-500 dark:bg-blue-400'}`} />
    </div>
  );
};

export default OrgNode;
