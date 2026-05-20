import { create } from 'zustand';
import {
  CANVAS_VIEWPORT_SIZE,
  clampZoom,
  createDefaultViewport,
  fitViewportToWorldBounds,
  panViewportByScreenDelta,
  type Point,
  type Viewport,
  type WorldBounds,
  zoomViewportAt
} from '../geometry/viewport';

export type ToolId = 'select' | 'pan' | 'line' | 'rectangle' | 'circle' | 'measure';

type UiState = {
  activeTool: ToolId;
  cursorWorld: Point;
  viewport: Viewport;
  fitToBounds: (bounds: WorldBounds | null) => void;
  panByScreenDelta: (delta: Point) => void;
  resetView: () => void;
  setActiveTool: (tool: ToolId) => void;
  setCursorWorld: (point: Point) => void;
  setZoom: (zoom: number) => void;
  zoomAt: (screenPoint: Point, zoom: number) => void;
};

const initialViewport = {
  cursorWorld: { x: 0, y: 0 },
  viewport: createDefaultViewport()
} satisfies Pick<UiState, 'cursorWorld' | 'viewport'>;

export const formatCoordinate = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  return value.toFixed(2);
};

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  ...initialViewport,
  fitToBounds: (bounds) =>
    set({
      viewport: fitViewportToWorldBounds(bounds, CANVAS_VIEWPORT_SIZE)
    }),
  panByScreenDelta: (delta) =>
    set((state) => ({
      viewport: panViewportByScreenDelta(state.viewport, delta)
    })),
  resetView: () =>
    set({
      cursorWorld: { x: 0, y: 0 },
      viewport: createDefaultViewport()
    }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setCursorWorld: (point) => set({ cursorWorld: point }),
  setZoom: (zoom) =>
    set((state) => ({
      viewport: { ...state.viewport, zoom: clampZoom(zoom) }
    })),
  zoomAt: (screenPoint, zoom) =>
    set((state) => ({
      viewport: zoomViewportAt(screenPoint, zoom, state.viewport, CANVAS_VIEWPORT_SIZE)
    }))
}));
