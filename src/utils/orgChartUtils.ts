import { Node, Edge } from 'reactflow';
import { OrgNodeData } from '../components/OrgNode';

export interface OrgNode {
  id: string;
  name: string;
  title: string;
  children?: OrgNode[];
}

export function convertToReactFlow(
  orgData: OrgNode,
  onEdit: (id: string, name: string, title: string) => void,
  onDelete: (id: string) => void,
  onAdd: (parentId: string) => void,
  x = 0,
  y = 0,
  level = 0
): { nodes: Node<OrgNodeData>[], edges: Edge[] } {
  const nodes: Node<OrgNodeData>[] = [];
  const edges: Edge[] = [];
  const childSpacing = 250; // Horizontal spacing between siblings
  const levelSpacing = 150; // Vertical spacing between levels
  
  const currentNode: Node<OrgNodeData> = {
    id: orgData.id,
    position: { x, y },
    data: {
      name: orgData.name,
      title: orgData.title,
      level,
      onEdit,
      onDelete,
      onAdd,
    },
    type: 'orgNode',
  };
  
  nodes.push(currentNode);
  
  if (orgData.children && orgData.children.length > 0) {
    const childrenWidth = (orgData.children.length - 1) * childSpacing;
    let startX = x - childrenWidth / 2;
    
    orgData.children.forEach((child, index) => {
      const childX = startX + index * childSpacing;
      const childY = y + levelSpacing;
      
      const childResult = convertToReactFlow(
        child,
        onEdit,
        onDelete,
        onAdd,
        childX,
        childY,
        level + 1
      );
      
      edges.push({
        id: `e-${orgData.id}-${child.id}`,
        source: orgData.id,
        target: child.id,
        type: 'smoothstep',
      });
      
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
    });
  }
  
  return { nodes, edges };
}

export function generateId(): string {
  return Date.now().toString();
}

export function createNewNode(): OrgNode {
  return {
    id: generateId(),
    name: '新しいメンバー',
    title: '役職名',
    children: [],
  };
}

export function addNodeToHierarchy(orgData: OrgNode, parentId: string): OrgNode {
  if (orgData.id === parentId) {
    const newChild = createNewNode();
    return {
      ...orgData,
      children: [...(orgData.children || []), newChild],
    };
  }
  
  if (orgData.children && orgData.children.length > 0) {
    return {
      ...orgData,
      children: orgData.children.map(child => addNodeToHierarchy(child, parentId)),
    };
  }
  
  return orgData;
}

export function deleteNodeFromHierarchy(orgData: OrgNode, nodeId: string): OrgNode | null {
  if (orgData.id === nodeId) {
    return orgData;
  }
  
  if (orgData.children && orgData.children.length > 0) {
    const filteredChildren = orgData.children
      .filter(child => child.id !== nodeId)
      .map(child => deleteNodeFromHierarchy(child, nodeId))
      .filter(child => child !== null) as OrgNode[];
    
    return {
      ...orgData,
      children: filteredChildren,
    };
  }
  
  return orgData;
}

export function updateNodeInHierarchy(
  orgData: OrgNode,
  nodeId: string,
  name: string,
  title: string
): OrgNode {
  if (orgData.id === nodeId) {
    return {
      ...orgData,
      name,
      title,
    };
  }
  
  if (orgData.children && orgData.children.length > 0) {
    return {
      ...orgData,
      children: orgData.children.map(child => 
        updateNodeInHierarchy(child, nodeId, name, title)
      ),
    };
  }
  
  return orgData;
}
