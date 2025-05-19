import React, { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  // addEdge,
  NodeTypes,
  OnConnect,
  Node,
  ReactFlowProvider,
  useOnSelectionChange,
  Panel,
  Connection
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
  getAllDepartments,
  bulkUpdateTitlesInHierarchy,
  changeNodeParentInHierarchy
} from './utils/orgChartUtils'
import { ThemeProvider } from './components/ui/theme-provider'
import { ThemeToggle } from './components/ui/theme-toggle'
import { ChartManager } from './components/ChartManager'
import { SearchFilter, FilterOptions } from './components/SearchFilter.tsx'
import { LayoutSelector, LayoutType } from './components/ui/layout-selector'
import { Button } from './components/ui/button'
import { saveCurrentChart, loadCurrentChart, saveLayoutPreference, loadLayoutPreference } from './utils/localStorageUtils'
import { BulkEditDialog } from './components/BulkEditDialog'
import { HistoryControls } from './components/HistoryControls'
import { SelectionControls } from './components/SelectionControls'
import {
  HistoryState,
  createHistoryState,
  recordChange,
  undo,
  redo,
  canUndo,
  canRedo
} from './utils/historyUtils'

const nodeTypes: NodeTypes = {
  orgNode: OrgNode,
}

function AppContent() {
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
  
  const [layout, setLayout] = useState<LayoutType>(() => loadLayoutPreference());
  
  const [historyState, setHistoryState] = useState<HistoryState>(() => 
    createHistoryState(orgData)
  );
  
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);

  const handleUndo = useCallback(() => {
    if (!canUndo(historyState)) return;
    const newState = undo(historyState);
    setHistoryState(newState);
    setOrgData(newState.present);
  }, [historyState]);

  const handleRedo = useCallback(() => {
    if (!canRedo(historyState)) return;
    const newState = redo(historyState);
    setHistoryState(newState);
    setOrgData(newState.present);
  }, [historyState]);

  const recordToHistory = useCallback((newData: HierarchicalNode) => {
    setHistoryState(current => recordChange(current, newData));
    setOrgData(newData);
    saveCurrentChart(newData);
  }, []);

  const handleNodeEdit = useCallback((_nodeId: string, _name: string, _title: string) => {}, []);
  const handleNodeDelete = useCallback((_nodeId: string) => {}, []);
  const handleNodeAdd = useCallback((_parentId: string) => {}, []);
  
  const handleAddNode = useCallback((parentId: string) => {
    const updatedOrgData = addNodeToHierarchy(orgData, parentId);
    recordToHistory(updatedOrgData);
    
    const { nodes: newNodes, edges: newEdges } = convertToReactFlow(
      updatedOrgData,
      handleNodeEdit,
      handleNodeDelete,
      handleNodeAdd,
      0, // x position
      0, // y position
      0, // level
      '', // no search query
      layout // current layout
    );
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [orgData, recordToHistory, layout, setNodes, setEdges]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedOrgData = deleteNodeFromHierarchy(orgData, nodeId);
    if (updatedOrgData) {
      recordToHistory(updatedOrgData);
      
      const { nodes: newNodes, edges: newEdges } = convertToReactFlow(
        updatedOrgData,
        handleNodeEdit,
        handleNodeDelete,
        handleNodeAdd,
        0, // x position
        0, // y position
        0, // level
        '', // no search query
        layout // current layout
      );
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [orgData, recordToHistory, layout, setNodes, setEdges]);

  const handleEditNode = useCallback((nodeId: string, name: string, title: string) => {
    const updatedOrgData = updateNodeInHierarchy(orgData, nodeId, name, title);
    recordToHistory(updatedOrgData);
    
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
  }, [orgData, recordToHistory, setNodes]);

  const handleBulkEdit = useCallback((newTitle: string) => {
    if (selectedNodes.length === 0) return;
    const updatedOrgData = bulkUpdateTitlesInHierarchy(orgData, selectedNodes, newTitle);
    recordToHistory(updatedOrgData);
  }, [orgData, selectedNodes, recordToHistory]);

  const handleBulkDelete = useCallback(() => {
    if (selectedNodes.length === 0) return;
    let updatedOrgData = orgData;
    for (const nodeId of selectedNodes) {
      const result = deleteNodeFromHierarchy(updatedOrgData, nodeId);
      if (result) updatedOrgData = result;
    }
    recordToHistory(updatedOrgData);
    setSelectedNodes([]);
  }, [orgData, selectedNodes, recordToHistory]);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes.map(node => node.id));
    },
  });

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const { source, target } = connection;
    if (source && target) {
      const updatedOrgData = changeNodeParentInHierarchy(orgData, target, source);
      recordToHistory(updatedOrgData);
    }
  }, [orgData, recordToHistory]);

  useEffect(() => {
    const departments = getAllDepartments(orgData);
    setAvailableDepartments(departments);
    
    const filtered = searchQuery || filterOptions.levels.length > 0 || filterOptions.departments.length > 0
      ? searchNodes(orgData, searchQuery, filterOptions)
      : orgData;
    
    
    const { nodes: initialNodes, edges: initialEdges } = convertToReactFlow(
      filtered || orgData, // Use filtered data or fallback to original
      handleEditNode,
      handleDeleteNode,
      handleAddNode,
      0, // x position
      0, // y position
      0, // level
      searchQuery, // Pass search query for highlighting
      layout // Pass current layout
    );
    
    const nodesWithSelection = initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isSelected: selectedNodes.includes(node.id),
      },
    }));
    
    setNodes(nodesWithSelection);
    setEdges(initialEdges);
  }, [orgData, searchQuery, filterOptions, handleEditNode, handleDeleteNode, handleAddNode, layout, selectedNodes, setNodes, setEdges]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    console.log(`Node ${node.id} moved to position:`, node.position);
    saveCurrentChart(orgData); // Save after node position changes
  }, [orgData]);
  
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayout(newLayout);
    saveLayoutPreference(newLayout);
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">組織図アプリ</h1>
            <HistoryControls
              canUndo={canUndo(historyState)}
              canRedo={canRedo(historyState)}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </div>
          <div className="flex items-center space-x-2">
            <ChartManager currentChart={orgData} onLoadChart={setOrgData} />
            <LayoutSelector currentLayout={layout} onLayoutChange={handleLayoutChange} />
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
            <div ref={reactFlowWrapper} className="w-full h-[550px] relative">
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
                  multiSelectionKeyCode="Shift"
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                  <Panel position="top-center">
                    <SelectionControls
                      selectedCount={selectedNodes.length}
                      onBulkEdit={() => setShowBulkEditDialog(true)}
                      onBulkDelete={handleBulkDelete}
                      onClearSelection={() => setSelectedNodes([])}
                    />
                  </Panel>
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
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            このアプリは組織図を表示・編集するためのReactアプリケーションです。
            ノードをドラッグして移動したり、ノードの上にホバーして編集・削除・追加ボタンを表示することができます。
            複数のノードを選択するには、Shiftキーを押しながらノードをクリックしてください。
          </p>
        </div>
        
        {/* Bulk Edit Dialog */}
        <BulkEditDialog
          isOpen={showBulkEditDialog}
          onClose={() => setShowBulkEditDialog(false)}
          onSave={handleBulkEdit}
          selectedCount={selectedNodes.length}
        />
      </div>
    </ThemeProvider>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}

export default App
