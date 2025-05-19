import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  saveChart, 
  getSavedCharts, 
  loadChart, 
  deleteChart,
  exportChart,
  importChart
} from '../utils/localStorageUtils';
import { OrgNode } from '../utils/orgChartUtils';
import { Save, FolderOpen, Download, Upload, Trash2, Menu } from 'lucide-react';

interface ChartManagerProps {
  currentChart: OrgNode;
  onLoadChart: (chart: OrgNode) => void;
}

export function ChartManager({ currentChart, onLoadChart }: ChartManagerProps) {
  const [savedCharts, setSavedCharts] = useState<{ id: string; name: string; timestamp: number }[]>([]);
  const [chartName, setChartName] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    refreshSavedCharts();
  }, []);

  const refreshSavedCharts = () => {
    const charts = getSavedCharts();
    setSavedCharts(charts.map(({ id, name, timestamp }) => ({ id, name, timestamp })));
  };

  const handleSaveChart = () => {
    if (!chartName.trim()) {
      alert('組織図の名前を入力してください');
      return;
    }

    try {
      saveChart(chartName, currentChart);
      refreshSavedCharts();
      setChartName('');
      setSaveDialogOpen(false);
    } catch (error) {
      alert('組織図の保存に失敗しました');
    }
  };

  const handleLoadChart = (id: string) => {
    const chart = loadChart(id);
    if (chart) {
      onLoadChart(chart);
    } else {
      alert('組織図の読み込みに失敗しました');
    }
  };

  const handleDeleteChart = (id: string) => {
    if (window.confirm('この組織図を削除してもよろしいですか？')) {
      deleteChart(id);
      refreshSavedCharts();
    }
  };

  const handleExport = () => {
    setExportData(exportChart(currentChart));
    setExportDialogOpen(true);
  };

  const handleImport = () => {
    try {
      const chart = importChart(importData);
      if (chart) {
        onLoadChart(chart);
        setImportData('');
        setIsImportDialogOpen(false);
      } else {
        alert('無効なデータ形式です');
      }
    } catch (error) {
      alert('インポートに失敗しました');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">組織図メニュー</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            <span>組織図を保存</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {savedCharts.length > 0 ? (
            <>
              <DropdownMenuItem disabled className="text-xs opacity-50">
                保存済み組織図
              </DropdownMenuItem>
              
              {savedCharts.map((chart) => (
                <DropdownMenuItem key={chart.id} className="flex justify-between items-center">
                  <div className="flex-1" onClick={() => handleLoadChart(chart.id)}>
                    <span>{chart.name}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(chart.timestamp)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChart(chart.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
            </>
          ) : (
            <DropdownMenuItem disabled>
              保存された組織図はありません
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            <span>エクスポート</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            <span>インポート</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>組織図を保存</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名前
              </Label>
              <Input
                id="name"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveChart}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>組織図をインポート</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="importData">
              JSON形式のデータを貼り付けてください
            </Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleImport}>インポート</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>組織図のエクスポート</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="exportData">
              以下のJSON形式のデータをコピーして保存してください
            </Label>
            <Textarea
              id="exportData"
              value={exportData}
              readOnly
              rows={10}
              className="font-mono text-sm"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => {
              navigator.clipboard.writeText(exportData);
              alert('クリップボードにコピーしました');
            }}>
              クリップボードにコピー
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
