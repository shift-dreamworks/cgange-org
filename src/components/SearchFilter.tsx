import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export interface FilterOptions {
  levels: number[];
  departments: string[];
}

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
  availableDepartments: string[];
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  filterOptions,
  onFilterChange,
  availableDepartments
}: SearchFilterProps) {
  const handleLevelToggle = (level: number) => {
    const newLevels = filterOptions.levels.includes(level)
      ? filterOptions.levels.filter(l => l !== level)
      : [...filterOptions.levels, level];
    
    onFilterChange({
      ...filterOptions,
      levels: newLevels
    });
  };

  const handleDepartmentToggle = (department: string) => {
    const newDepartments = filterOptions.departments.includes(department)
      ? filterOptions.departments.filter(d => d !== department)
      : [...filterOptions.departments, department];
    
    onFilterChange({
      ...filterOptions,
      departments: newDepartments
    });
  };

  const clearFilters = () => {
    onFilterChange({
      levels: [],
      departments: []
    });
  };

  const levelNames = [
    '役員レベル',
    '部長レベル',
    'マネージャーレベル',
    'スタッフレベル'
  ];

  const hasActiveFilters = filterOptions.levels.length > 0 || filterOptions.departments.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="名前や役職で検索..."
          className="pl-8 w-full"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4"
            onClick={() => onSearchChange('')}
          >
            <span>×</span>
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={hasActiveFilters ? 'border-primary text-primary hover:bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            フィルター
            {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center">
              {filterOptions.levels.length + filterOptions.departments.length}
            </span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2">
          <div className="mb-2">
            <Label className="text-xs font-bold mb-1 block">役職レベル</Label>
            {[0, 1, 2, 3].map((level) => (
              <DropdownMenuCheckboxItem
                key={`level-${level}`}
                checked={filterOptions.levels.includes(level)}
                onCheckedChange={() => handleLevelToggle(level)}
              >
                {levelNames[level]}
              </DropdownMenuCheckboxItem>
            ))}
          </div>

          {availableDepartments.length > 0 && (
            <div className="mt-2">
              <Label className="text-xs font-bold mb-1 block">部門</Label>
              {availableDepartments.map((dept) => (
                <DropdownMenuCheckboxItem
                  key={`dept-${dept}`}
                  checked={filterOptions.departments.includes(dept)}
                  onCheckedChange={() => handleDepartmentToggle(dept)}
                >
                  {dept}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          )}
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-xs"
              onClick={clearFilters}
            >
              フィルターをクリア
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
