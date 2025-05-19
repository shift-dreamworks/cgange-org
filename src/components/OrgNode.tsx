import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PencilIcon, TrashIcon, PlusIcon, XIcon, CheckIcon } from 'lucide-react';
import { Input } from './ui/input';

export interface OrgNodeData {
  name: string;
  title: string;
  isEditing?: boolean;
  onDelete?: (id: string) => void;
  onAdd?: (parentId: string) => void;
  onEdit?: (id: string, name: string, title: string) => void;
}

const OrgNode = ({ id, data }: NodeProps<OrgNodeData>) => {
  const [editMode, setEditMode] = useState(false);
  const [nameValue, setNameValue] = useState(data.name);
  const [titleValue, setTitleValue] = useState(data.title);

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
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 dark:bg-blue-400" />
      <Card 
        className="min-w-[220px] p-3 shadow-lg transition-all duration-200 
                  hover:shadow-xl border-2 border-zinc-100 dark:border-zinc-800
                  bg-gradient-to-br from-white to-zinc-50
                  dark:from-zinc-900 dark:to-zinc-950"
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
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{data.title}</div>
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
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 dark:bg-blue-400" />
    </div>
  );
};

export default OrgNode;
