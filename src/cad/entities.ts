import type { Point } from '../geometry/viewport';

export const DRAWING_TOOLS = ['line', 'rectangle', 'circle'] as const;
export type DrawingTool = (typeof DRAWING_TOOLS)[number];

export type EntityStyle = {
  fill?: string;
  stroke: string;
  strokeWidth: number;
};

type EntityBase = EntityStyle & {
  id: string;
};

export type LineEntity = EntityBase & {
  end: Point;
  start: Point;
  type: 'line';
};

export type RectangleEntity = EntityBase & {
  height: number;
  type: 'rectangle';
  width: number;
  x: number;
  y: number;
};

export type CircleEntity = EntityBase & {
  center: Point;
  radius: number;
  type: 'circle';
};

export type CadEntity = LineEntity | RectangleEntity | CircleEntity;

export type DrawingDraft = {
  current: Point;
  start: Point;
  tool: DrawingTool;
};

export type RectGeometry = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export const MIN_ENTITY_SIZE = 1;

export const DEFAULT_ENTITY_STYLE = {
  fill: 'none',
  stroke: '#1f2937',
  strokeWidth: 1.5
} satisfies EntityStyle;

export const isDrawingTool = (tool: string): tool is DrawingTool =>
  DRAWING_TOOLS.includes(tool as DrawingTool);

export const getDistance = (start: Point, end: Point) =>
  Math.hypot(end.x - start.x, end.y - start.y);

export const normalizeRectangle = (start: Point, end: Point): RectGeometry => ({
  height: Math.abs(end.y - start.y),
  width: Math.abs(end.x - start.x),
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y)
});

export const createEntityFromDraft = (
  id: string,
  draft: DrawingDraft,
  style: EntityStyle = DEFAULT_ENTITY_STYLE
): CadEntity | null => {
  if (draft.tool === 'line') {
    if (getDistance(draft.start, draft.current) < MIN_ENTITY_SIZE) {
      return null;
    }

    return {
      ...style,
      end: draft.current,
      id,
      start: draft.start,
      type: 'line'
    };
  }

  if (draft.tool === 'rectangle') {
    const rect = normalizeRectangle(draft.start, draft.current);

    if (rect.width < MIN_ENTITY_SIZE || rect.height < MIN_ENTITY_SIZE) {
      return null;
    }

    return {
      ...style,
      ...rect,
      id,
      type: 'rectangle'
    };
  }

  const radius = getDistance(draft.start, draft.current);

  if (radius < MIN_ENTITY_SIZE) {
    return null;
  }

  return {
    ...style,
    center: draft.start,
    id,
    radius,
    type: 'circle'
  };
};
