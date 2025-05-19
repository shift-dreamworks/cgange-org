import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, CircleDot, LayoutGrid } from 'lucide-react';

export type LayoutType = 'vertical' | 'horizontal' | 'radial' | 'compact';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export function LayoutSelector({ currentLayout, onLayoutChange }: LayoutSelectorProps) {
  const layouts = [
    { value: 'vertical', label: '垂直レイアウト', icon: AlignVerticalJustifyCenter },
    { value: 'horizontal', label: '水平レイアウト', icon: AlignHorizontalJustifyCenter },
    { value: 'radial', label: '放射状レイアウト', icon: CircleDot },
    { value: 'compact', label: 'コンパクトレイアウト', icon: LayoutGrid },
  ] as const;

  const currentLayoutData = layouts.find((l) => l.value === currentLayout) || layouts[0];
  const Icon = currentLayoutData.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="レイアウト切替">
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {layouts.map((layout) => {
          const LayoutIcon = layout.icon;
          return (
            <DropdownMenuItem
              key={layout.value}
              onClick={() => onLayoutChange(layout.value)}
              className={currentLayout === layout.value ? "bg-primary/10" : ""}
            >
              <LayoutIcon className="mr-2 h-4 w-4" />
              {layout.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
