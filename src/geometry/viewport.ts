export type Point = {
  x: number;
  y: number;
};

export type ViewportSize = {
  width: number;
  height: number;
};

export type Viewport = {
  center: Point;
  zoom: number;
};

export type WorldBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const CANVAS_VIEWPORT_SIZE = {
  width: 960,
  height: 640
} satisfies ViewportSize;

export const MIN_ZOOM = 0.125;
export const MAX_ZOOM = 8;

export const createDefaultViewport = (): Viewport => ({
  center: { x: 0, y: 0 },
  zoom: 1
});

export const clampZoom = (zoom: number) => {
  if (!Number.isFinite(zoom)) {
    return 1;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
};

export const screenToWorld = (
  screenPoint: Point,
  viewport: Viewport,
  viewportSize: ViewportSize
): Point => ({
  x: viewport.center.x + (screenPoint.x - viewportSize.width / 2) / viewport.zoom,
  y: viewport.center.y - (screenPoint.y - viewportSize.height / 2) / viewport.zoom
});

export const worldToScreen = (
  worldPoint: Point,
  viewport: Viewport,
  viewportSize: ViewportSize
): Point => ({
  x: viewportSize.width / 2 + (worldPoint.x - viewport.center.x) * viewport.zoom,
  y: viewportSize.height / 2 - (worldPoint.y - viewport.center.y) * viewport.zoom
});

export const zoomViewportAt = (
  screenPoint: Point,
  nextZoom: number,
  viewport: Viewport,
  viewportSize: ViewportSize
): Viewport => {
  const worldAnchor = screenToWorld(screenPoint, viewport, viewportSize);
  const zoom = clampZoom(nextZoom);

  return {
    center: {
      x: worldAnchor.x - (screenPoint.x - viewportSize.width / 2) / zoom,
      y: worldAnchor.y + (screenPoint.y - viewportSize.height / 2) / zoom
    },
    zoom
  };
};

export const panViewportByScreenDelta = (viewport: Viewport, delta: Point): Viewport => ({
  center: {
    x: viewport.center.x - delta.x / viewport.zoom,
    y: viewport.center.y + delta.y / viewport.zoom
  },
  zoom: viewport.zoom
});

export const getVisibleWorldBounds = (
  viewport: Viewport,
  viewportSize: ViewportSize
): WorldBounds => {
  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport, viewportSize);
  const bottomRight = screenToWorld(
    { x: viewportSize.width, y: viewportSize.height },
    viewport,
    viewportSize
  );

  return {
    minX: Math.min(topLeft.x, bottomRight.x),
    maxX: Math.max(topLeft.x, bottomRight.x),
    minY: Math.min(topLeft.y, bottomRight.y),
    maxY: Math.max(topLeft.y, bottomRight.y)
  };
};

export const toWorldTransform = (viewport: Viewport, viewportSize: ViewportSize) =>
  [
    `translate(${viewportSize.width / 2} ${viewportSize.height / 2})`,
    `scale(${viewport.zoom} ${-viewport.zoom})`,
    `translate(${-viewport.center.x} ${-viewport.center.y})`
  ].join(' ');
