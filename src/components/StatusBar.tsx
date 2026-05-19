import { formatCoordinate, useUiStore } from '../store/useUiStore';
import { useDocumentStore } from '../store/useDocumentStore';

const toolLabels = {
  select: '选择',
  pan: '平移',
  line: '直线',
  rectangle: '矩形',
  circle: '圆',
  measure: '测量'
} as const;

export function StatusBar() {
  const activeTool = useUiStore((state) => state.activeTool);
  const cursorWorld = useUiStore((state) => state.cursorWorld);
  const viewport = useUiStore((state) => state.viewport);
  const entityCount = useDocumentStore((state) => state.entities.length);
  const measurementCount = useDocumentStore((state) => state.measurements.length);
  const saveStatus = useDocumentStore((state) => state.saveStatus);

  return (
    <footer className="status-bar">
      <span>工具：{toolLabels[activeTool]}</span>
      <span>对象：{entityCount}</span>
      <span>测量：{measurementCount}</span>
      <span>缩放：{Math.round(viewport.zoom * 100)}%</span>
      <span>
        X {formatCoordinate(cursorWorld.x)} / Y {formatCoordinate(cursorWorld.y)}
      </span>
      <span>
        中心 X {formatCoordinate(viewport.center.x)} / Y {formatCoordinate(viewport.center.y)}
      </span>
      <span>保存：{saveStatus}</span>
    </footer>
  );
}
