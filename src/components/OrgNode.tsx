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
      <Handle type="target" position={Position.Top} />
      <Card className="min-w-[200px] p-3 shadow-md">
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
          <div>
            <div className="font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.title}</div>
            <div className="hidden group-hover:flex absolute top-1 right-1 space-x-1">
              <Button size="icon" variant="ghost" onClick={handleEdit} className="h-6 w-6">
                <PencilIcon className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleDelete} className="h-6 w-6">
                <TrashIcon className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleAdd} className="h-6 w-6">
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default OrgNode;
