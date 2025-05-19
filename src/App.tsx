import React, { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeTypes,
  OnConnect,
  Node,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import OrgNode, { OrgNodeData } from './components/OrgNode'
import { 
  OrgNode as HierarchicalNode,
  convertToReactFlow,
  addNodeToHierarchy,
  deleteNodeFromHierarchy,
  updateNodeInHierarchy,
  searchNodes,
  getAllDepartments
} from './utils/orgChartUtils'
import { ThemeProvider } from './components/ui/theme-provider'
import { ThemeToggle } from './components/ui/theme-toggle'
import { ChartManager } from './components/ChartManager'
import { SearchFilter, FilterOptions } from './components/SearchFilter'
import { saveCurrentChart, loadCurrentChart } from './utils/localStorageUtils'

const nodeTypes: NodeTypes = {
  orgNode: OrgNode,
}

function App() {
  const [orgData, setOrgData] = useState<HierarchicalNode>(() => {
    const savedData = loadCurrentChart();
    if (savedData) {
      return savedData;
    }
    
    return {
      id: '1',
      name: '山田太郎',
      title: '代表取締役社長',
      children: [
        {
          id: '2',
          name: '佐藤一郎',
          title: '営業部長',
          children: [
            {
              id: '4',
              name: '高橋花子',
              title: '営業マネージャー',
              children: []
            },
            {
              id: '5',
              name: '鈴木健太',
              title: '営業担当',
              children: []
            }
          ]
        },
        {
          id: '3',
          name: '田中次郎',
          title: '技術部長',
          children: [
            {
              id: '6',
              name: '伊藤誠',
              title: '開発リーダー',
              children: []
            },
            {
              id: '7',
              name: '渡辺真理',
              title: 'デザイナー',
              children: []
            }
          ]
        }
      ]
    };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<OrgNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ 
    levels: [], 
    departments: [] 
  });
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [filteredOrgData, setFilteredOrgData] = useState<HierarchicalNode | null>(null);

  const handleAddNode = useCallback((parentId: string) => {
    const updatedOrgData = addNodeToHierarchy(orgData, parentId);
    setOrgData(updatedOrgData);
    
    saveCurrentChart(updatedOrgData);
    
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow(
      updatedOrgData,
      handleEditNode,
      handleDeleteNode,
      handleAddNode
    );
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [orgData, setNodes, setEdges]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedOrgData = deleteNodeFromHierarchy(orgData, nodeId);
    if (updatedOrgData) {
      setOrgData(updatedOrgData);
      
      saveCurrentChart(updatedOrgData);
      
      const { nodes: newNodes, edges: newEdges } = convertToReactFlow(
        updatedOrgData,
        handleEditNode,
        handleDeleteNode,
        handleAddNode
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [orgData, setNodes, setEdges]);

  const handleEditNode = useCallback((nodeId: string, name: string, title: string) => {
    const updatedOrgData = updateNodeInHierarchy(orgData, nodeId, name, title);
    setOrgData(updatedOrgData);
    
    saveCurrentChart(updatedOrgData);
    
    setNodes(nodes => nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            name,
            title,
          },
        };
      }
      return node;
    }));
  }, [orgData, setNodes]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  useEffect(() => {
    const departments = getAllDepartments(orgData);
    setAvailableDepartments(departments);
    
    const filtered = searchQuery || filterOptions.levels.length > 0 || filterOptions.departments.length > 0
      ? searchNodes(orgData, searchQuery, filterOptions)
      : orgData;
    
    setFilteredOrgData(filtered);
    
    const { nodes: initialNodes, edges: initialEdges } = convertToReactFlow(
      filtered || orgData, // Use filtered data or fallback to original
      handleEditNode,
      handleDeleteNode,
      handleAddNode,
      0, // x position
      0, // y position
      0, // level
      searchQuery // Pass search query for highlighting
    );
    
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [orgData, searchQuery, filterOptions, handleEditNode, handleDeleteNode, handleAddNode, setNodes, setEdges]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    console.log(`Node ${node.id} moved to position:`, node.position);
    saveCurrentChart(orgData); // Save after node position changes
  }, [orgData]);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">組織図アプリ</h1>
          <div className="flex items-center space-x-2">
            <ChartManager currentChart={orgData} onLoadChart={setOrgData} />
            <ThemeToggle />
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>組織図</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilter 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterOptions={filterOptions}
              onFilterChange={setFilterOptions}
              availableDepartments={availableDepartments}
            />
            <div ref={reactFlowWrapper} className="w-full h-[550px]">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeDragStop={onNodeDragStop}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                </ReactFlow>
                {nodes.length === 0 && (searchQuery || filterOptions.levels.length > 0 || filterOptions.departments.length > 0) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10">
                    <Card className="p-4 shadow-lg max-w-md text-center">
                      <p className="text-lg font-bold">検索結果がありません</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                        検索条件を変更するか、フィルターをクリアしてください。
                      </p>
                      <Button 
                        onClick={() => {
                          setSearchQuery('');
                          setFilterOptions({ levels: [], departments: [] });
                        }}
                        className="mt-4"
                      >
                        フィルターをクリア
                      </Button>
                    </Card>
                  </div>
                )}
              </ReactFlowProvider>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            このアプリは組織図を表示・編集するためのReactアプリケーションです。
            ノードをドラッグして移動したり、ノードの上にホバーして編集・削除・追加ボタンを表示することができます。
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
