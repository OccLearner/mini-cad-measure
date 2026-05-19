import { Circle, Hand, MousePointer2, Ruler, Slash, Square } from 'lucide-react';
import { type ToolId, useUiStore } from '../store/useUiStore';

type ToolItem = {
  id: ToolId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const tools: ToolItem[] = [
  { id: 'select', label: '选择', icon: MousePointer2 },
  { id: 'pan', label: '平移', icon: Hand },
  { id: 'line', label: '直线', icon: Slash },
  { id: 'rectangle', label: '矩形', icon: Square },
  { id: 'circle', label: '圆', icon: Circle },
  { id: 'measure', label: '测量', icon: Ruler }
];

export function LeftToolbar() {
  const activeTool = useUiStore((state) => state.activeTool);
  const setActiveTool = useUiStore((state) => state.setActiveTool);

  return (
    <nav className="left-toolbar" aria-label="绘图工具">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            aria-label={tool.label}
            aria-pressed={isActive}
            className="tool-button"
            data-active={isActive}
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            type="button"
          >
            <Icon size={20} strokeWidth={2} />
          </button>
        );
      })}
    </nav>
  );
}
