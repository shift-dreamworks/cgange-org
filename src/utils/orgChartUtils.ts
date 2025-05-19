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
      
      const childResult = convertToReactFlow(
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
