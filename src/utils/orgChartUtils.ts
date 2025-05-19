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
  level = 0,
  searchQuery = '',
  layout: 'vertical' | 'horizontal' | 'radial' | 'compact' = 'vertical'
): { nodes: Node<OrgNodeData>[], edges: Edge[] } {
  switch (layout) {
    case 'horizontal':
      return convertToHorizontalLayout(orgData, onEdit, onDelete, onAdd, x, y, level, searchQuery);
    case 'radial':
      return convertToRadialLayout(orgData, onEdit, onDelete, onAdd, x, y, level, searchQuery);
    case 'compact':
      return convertToCompactLayout(orgData, onEdit, onDelete, onAdd, x, y, level, searchQuery);
    case 'vertical':
    default:
      return convertToVerticalLayout(orgData, onEdit, onDelete, onAdd, x, y, level, searchQuery);
  }
}

function convertToVerticalLayout(
  orgData: OrgNode,
  onEdit: (id: string, name: string, title: string) => void,
  onDelete: (id: string) => void,
  onAdd: (parentId: string) => void,
  x = 0,
  y = 0,
  level = 0,
  searchQuery = ''
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
      matchesSearch: searchQuery ? 
        (orgData.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         orgData.title.toLowerCase().includes(searchQuery.toLowerCase())) : 
        false,
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
      
      const childResult = convertToVerticalLayout(
        child,
        onEdit,
        onDelete,
        onAdd,
        childX,
        childY,
        level + 1,
        searchQuery
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

function convertToHorizontalLayout(
  orgData: OrgNode,
  onEdit: (id: string, name: string, title: string) => void,
  onDelete: (id: string) => void,
  onAdd: (parentId: string) => void,
  x = 0,
  y = 0,
  level = 0,
  searchQuery = ''
): { nodes: Node<OrgNodeData>[], edges: Edge[] } {
  const nodes: Node<OrgNodeData>[] = [];
  const edges: Edge[] = [];
  const childSpacing = 150; // Vertical spacing between siblings
  const levelSpacing = 300; // Horizontal spacing between levels
  
  const currentNode: Node<OrgNodeData> = {
    id: orgData.id,
    position: { x, y },
    data: {
      name: orgData.name,
      title: orgData.title,
      level,
      matchesSearch: searchQuery ? 
        (orgData.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         orgData.title.toLowerCase().includes(searchQuery.toLowerCase())) : 
        false,
      onEdit,
      onDelete,
      onAdd,
    },
    type: 'orgNode',
  };
  
  nodes.push(currentNode);
  
  if (orgData.children && orgData.children.length > 0) {
    const childrenHeight = (orgData.children.length - 1) * childSpacing;
    let startY = y - childrenHeight / 2;
    
    orgData.children.forEach((child, index) => {
      const childY = startY + index * childSpacing;
      const childX = x + levelSpacing;
      
      const childResult = convertToHorizontalLayout(
        child,
        onEdit,
        onDelete,
        onAdd,
        childX,
        childY,
        level + 1,
        searchQuery
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

function convertToRadialLayout(
  orgData: OrgNode,
  onEdit: (id: string, name: string, title: string) => void,
  onDelete: (id: string) => void,
  onAdd: (parentId: string) => void,
  x = 0,
  y = 0,
  level = 0,
  searchQuery = '',
  angle = 0
): { nodes: Node<OrgNodeData>[], edges: Edge[] } {
  const nodes: Node<OrgNodeData>[] = [];
  const edges: Edge[] = [];
  
  if (level === 0) {
    x = 0;
    y = 0;
  }
  
  const levelRadius = level === 0 ? 0 : 200 * level; // Increase radius for each level
  const currentNodeX = level === 0 ? x : x + levelRadius * Math.cos(angle);
  const currentNodeY = level === 0 ? y : y + levelRadius * Math.sin(angle);
  
  const currentNode: Node<OrgNodeData> = {
    id: orgData.id,
    position: { x: currentNodeX, y: currentNodeY },
    data: {
      name: orgData.name,
      title: orgData.title,
      level,
      matchesSearch: searchQuery ? 
        (orgData.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         orgData.title.toLowerCase().includes(searchQuery.toLowerCase())) : 
        false,
      onEdit,
      onDelete,
      onAdd,
    },
    type: 'orgNode',
  };
  
  nodes.push(currentNode);
  
  if (orgData.children && orgData.children.length > 0) {
    const numberOfChildren = orgData.children.length;
    
    let startAngle = level === 0 ? 0 : angle - Math.PI / 4;
    let endAngle = level === 0 ? 2 * Math.PI : angle + Math.PI / 4;
    let angleRange = endAngle - startAngle;
    
    orgData.children.forEach((child, index) => {
      const childAngle = startAngle + (angleRange * index) / Math.max(1, numberOfChildren - 1);
      
      const childResult = convertToRadialLayout(
        child,
        onEdit,
        onDelete,
        onAdd,
        currentNodeX,
        currentNodeY,
        level + 1,
        searchQuery,
        childAngle
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

function convertToCompactLayout(
  orgData: OrgNode,
  onEdit: (id: string, name: string, title: string) => void,
  onDelete: (id: string) => void,
  onAdd: (parentId: string) => void,
  x = 0,
  y = 0,
  level = 0,
  searchQuery = ''
): { nodes: Node<OrgNodeData>[], edges: Edge[] } {
  const nodes: Node<OrgNodeData>[] = [];
  const edges: Edge[] = [];
  const childSpacing = 180; // Horizontal spacing between siblings
  const levelSpacing = 100; // Vertical spacing between levels
  
  const currentNode: Node<OrgNodeData> = {
    id: orgData.id,
    position: { x, y },
    data: {
      name: orgData.name,
      title: orgData.title,
      level,
      matchesSearch: searchQuery ? 
        (orgData.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         orgData.title.toLowerCase().includes(searchQuery.toLowerCase())) : 
        false,
      onEdit,
      onDelete,
      onAdd,
    },
    type: 'orgNode',
  };
  
  nodes.push(currentNode);
  
  if (orgData.children && orgData.children.length > 0) {
    const childrenInfo = orgData.children.map((child, index) => {
      const subtreeSize = countSubtreeNodes(child);
      return { index, subtreeSize, child };
    });
    
    childrenInfo.sort((a, b) => b.subtreeSize - a.subtreeSize);
    
    const totalWidth = childrenInfo.reduce((acc, info) => acc + info.subtreeSize, 0) * childSpacing;
    let startX = x - totalWidth / 2;
    
    childrenInfo.forEach(({ subtreeSize, child }) => {
      const childX = startX + (subtreeSize * childSpacing) / 2;
      const childY = y + levelSpacing;
      
      const childResult = convertToCompactLayout(
        child,
        onEdit,
        onDelete,
        onAdd,
        childX,
        childY,
        level + 1,
        searchQuery
      );
      
      edges.push({
        id: `e-${orgData.id}-${child.id}`,
        source: orgData.id,
        target: child.id,
        type: 'smoothstep',
      });
      
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
      
      startX += subtreeSize * childSpacing;
    });
  }
  
  return { nodes, edges };
}

function countSubtreeNodes(node: OrgNode): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  return 1 + node.children.reduce((acc, child) => acc + countSubtreeNodes(child), 0);
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

export function extractDepartment(title: string): string {
  if (!title) return '';
  
  const match = title.match(/(.+?)[部課チーム]/);
  if (match && match[1]) {
    return match[1] + (title.includes('部') ? '部' : title.includes('課') ? '課' : title.includes('チーム') ? 'チーム' : '');
  }
  
  return title;
}

export function getAllDepartments(orgData: OrgNode): string[] {
  const departments = new Set<string>();
  
  function traverse(node: OrgNode) {
    const department = extractDepartment(node.title);
    if (department) {
      departments.add(department);
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(orgData);
  return Array.from(departments).filter(Boolean);
}

export function searchNodes(
  orgData: OrgNode, 
  query: string, 
  filterOptions: { levels: number[], departments: string[] } = { levels: [], departments: [] }
): OrgNode | null {
  if (!query && filterOptions.levels.length === 0 && filterOptions.departments.length === 0) {
    return orgData; // Return unmodified data if no search or filters
  }
  
  const result = JSON.parse(JSON.stringify(orgData)) as OrgNode;
  
  const normalizedQuery = query.toLowerCase();
  
  const visibleNodeIds = new Set<string>();
  
  function identifyMatches(node: OrgNode, level: number = 0): boolean {
    const matchesSearch = !query || 
      node.name.toLowerCase().includes(normalizedQuery) || 
      node.title.toLowerCase().includes(normalizedQuery);
    
    const matchesLevel = filterOptions.levels.length === 0 || 
      filterOptions.levels.includes(Math.min(level, 3));
    
    const department = extractDepartment(node.title);
    const matchesDepartment = filterOptions.departments.length === 0 || 
      filterOptions.departments.includes(department);
    
    let hasMatchingChild = false;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (identifyMatches(child, level + 1)) {
          hasMatchingChild = true;
        }
      }
    }
    
    const isVisible = (matchesSearch && matchesLevel && matchesDepartment) || hasMatchingChild;
    
    if (isVisible) {
      visibleNodeIds.add(node.id);
    }
    
    return isVisible;
  }
  
  function filterTree(node: OrgNode): OrgNode | null {
    if (!visibleNodeIds.has(node.id)) {
      return null;
    }
    
    const filteredChildren = node.children
      ? node.children
          .map(filterTree)
          .filter((child): child is OrgNode => child !== null)
      : [];
    
    return {
      ...node,
      children: filteredChildren
    };
  }
  
  identifyMatches(result);
  return filterTree(result);
}

export function bulkUpdateTitlesInHierarchy(
  orgData: OrgNode,
  nodeIds: string[],
  newTitle: string
): OrgNode {
  if (nodeIds.length === 0) return orgData;

  let updatedData = { ...orgData };
  
  function updateNodeTitles(node: OrgNode): OrgNode {
    if (nodeIds.includes(node.id)) {
      return {
        ...node,
        title: newTitle,
        children: node.children?.map(updateNodeTitles)
      };
    }

    return {
      ...node,
      children: node.children?.map(updateNodeTitles)
    };
  }

  return updateNodeTitles(updatedData);
}

export function changeNodeParentInHierarchy(
  orgData: OrgNode,
  nodeId: string,
  newParentId: string
): OrgNode {
  if (isDescendant(orgData, newParentId, nodeId)) {
    return orgData;
  }

  const nodeToMove = findNodeById(orgData, nodeId);
  if (!nodeToMove) return orgData;
  
  const orgDataWithoutNode = deleteNodeFromHierarchy(orgData, nodeId);
  if (!orgDataWithoutNode) return orgData;
  
  return addExistingNodeToHierarchy(orgDataWithoutNode, newParentId, nodeToMove);
}

function isDescendant(orgData: OrgNode, potentialDescendant: string, nodeId: string): boolean {
  if (potentialDescendant === nodeId) return true;
  
  if (orgData.id === nodeId && orgData.children) {
    return !!orgData.children.find(child => isDescendant(child, potentialDescendant, child.id));
  }
  
  if (orgData.children) {
    return !!orgData.children.find(child => isDescendant(child, potentialDescendant, nodeId));
  }
  
  return false;
}

export function findNodeById(orgData: OrgNode, nodeId: string): OrgNode | null {
  if (orgData.id === nodeId) {
    return orgData;
  }
  
  if (orgData.children) {
    for (const child of orgData.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }
  
  return null;
}

function addExistingNodeToHierarchy(
  orgData: OrgNode,
  parentId: string,
  nodeToAdd: OrgNode
): OrgNode {
  if (orgData.id === parentId) {
    return {
      ...orgData,
      children: [...(orgData.children || []), nodeToAdd],
    };
  }
  
  if (orgData.children && orgData.children.length > 0) {
    return {
      ...orgData,
      children: orgData.children.map(child => 
        addExistingNodeToHierarchy(child, parentId, nodeToAdd)
      ),
    };
  }
  
  return orgData;
}

export function findParentNode(orgData: OrgNode, nodeId: string): OrgNode | null {
  if (orgData.children && orgData.children.some(child => child.id === nodeId)) {
    return orgData;
  }
  
  if (orgData.children) {
    for (const child of orgData.children) {
      const parent = findParentNode(child, nodeId);
      if (parent) return parent;
    }
  }
  
  return null;
}
