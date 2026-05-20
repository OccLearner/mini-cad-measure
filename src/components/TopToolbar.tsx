import {
  FolderOpen,
  Maximize2,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { getDocumentBounds } from '../cad/bounds';
import { CANVAS_VIEWPORT_SIZE } from '../geometry/viewport';
import { useDocumentStore } from '../store/useDocumentStore';
import { useUiStore } from '../store/useUiStore';

export function TopToolbar() {
  const canRedo = useDocumentStore((state) => state.redoStack.length > 0);
  const canUndo = useDocumentStore((state) => state.undoStack.length > 0);
  const clearDocument = useDocumentStore((state) => state.clearDocument);
  const entities = useDocumentStore((state) => state.entities);
  const loadLocalDocument = useDocumentStore((state) => state.loadLocalDocument);
  const measurements = useDocumentStore((state) => state.measurements);
  const redo = useDocumentStore((state) => state.redo);
  const saveLocalDocument = useDocumentStore((state) => state.saveLocalDocument);
  const undo = useDocumentStore((state) => state.undo);
  const fitToBounds = useUiStore((state) => state.fitToBounds);
  const resetView = useUiStore((state) => state.resetView);
  const viewport = useUiStore((state) => state.viewport);
  const zoomAt = useUiStore((state) => state.zoomAt);
  const zoomPoint = {
    x: CANVAS_VIEWPORT_SIZE.width / 2,
    y: CANVAS_VIEWPORT_SIZE.height / 2
  };
  const handleClear = () => {
    if (window.confirm('清空当前画布？')) {
      clearDocument();
    }
  };
  const handleFitAll = () => {
    fitToBounds(getDocumentBounds(entities, measurements));
  };

  return (
    <header className="top-toolbar" role="banner">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          MC
        </span>
        <span className="brand-name">mini-cad-measure</span>
      </div>

      <div className="toolbar-group" aria-label="编辑操作">
        <button
          className="icon-button"
          type="button"
          title="撤销"
          aria-label="撤销"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="重做"
          aria-label="重做"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="保存"
          aria-label="保存"
          onClick={() => saveLocalDocument()}
        >
          <Save size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="加载"
          aria-label="加载"
          onClick={() => loadLocalDocument()}
        >
          <FolderOpen size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="清空"
          aria-label="清空"
          onClick={handleClear}
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="缩小"
          aria-label="缩小"
          onClick={() => zoomAt(zoomPoint, viewport.zoom / 1.25)}
        >
          <ZoomOut size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="放大"
          aria-label="放大"
          onClick={() => zoomAt(zoomPoint, viewport.zoom * 1.25)}
        >
          <ZoomIn size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="Fit All"
          aria-label="Fit All"
          onClick={handleFitAll}
        >
          <Maximize2 size={18} strokeWidth={2} />
        </button>
        <button
          className="icon-button"
          type="button"
          title="重置视图"
          aria-label="重置视图"
          onClick={resetView}
        >
          <RotateCcw size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
