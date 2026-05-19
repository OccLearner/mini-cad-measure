import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import {
  CANVAS_VIEWPORT_SIZE,
  getVisibleWorldBounds,
  screenToWorld,
  toWorldTransform,
  type Point,
  type WorldBounds
} from '../geometry/viewport';
import { hitTestEntities } from '../cad/hitTest';
import { isDrawingTool } from '../cad/entities';
import { createMeasurementFromDraft } from '../cad/measurements';
import { CadEntities } from './CadEntities';
import { CadMeasurements } from './CadMeasurements';
import { useDocumentStore } from '../store/useDocumentStore';
import { useUiStore } from '../store/useUiStore';

const MIN_GRID_PIXEL_GAP = 24;
const MAX_GRID_PIXEL_GAP = 56;
const SELECTION_TOLERANCE_PX = 8;
const WHEEL_ZOOM_INTENSITY = 0.0015;

const toCanvasPoint = (
  event: ReactPointerEvent<SVGSVGElement> | ReactWheelEvent<SVGSVGElement>
) => {
  const svg = event.currentTarget;
  const point = svg.createSVGPoint();
  const matrix = svg.getScreenCTM();

  if (!matrix) {
    return null;
  }

  point.x = event.clientX;
  point.y = event.clientY;

  const canvasPoint = point.matrixTransform(matrix.inverse());

  return {
    x: canvasPoint.x,
    y: canvasPoint.y
  };
};

const getGridStep = (zoom: number) => {
  let step = 10;

  while (step * zoom < MIN_GRID_PIXEL_GAP) {
    step *= 2;
  }

  while (step * zoom > MAX_GRID_PIXEL_GAP && step > 1) {
    step /= 2;
  }

  return step;
};

const getTicks = (min: number, max: number, step: number) => {
  const ticks: number[] = [];
  const first = Math.floor(min / step) * step;

  for (let value = first; value <= max; value += step) {
    ticks.push(Math.abs(value) < Number.EPSILON ? 0 : value);
  }

  return ticks;
};

const getGridModel = (bounds: WorldBounds, zoom: number) => {
  const step = getGridStep(zoom);
  const majorStep = step * 5;

  return {
    majorStep,
    step,
    xTicks: getTicks(bounds.minX, bounds.maxX, step),
    yTicks: getTicks(bounds.minY, bounds.maxY, step)
  };
};

export function CadCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panRef = useRef<{ lastPoint: Point; pointerId: number } | null>(null);
  const drawingRef = useRef<{ pointerId: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const activeTool = useUiStore((state) => state.activeTool);
  const viewport = useUiStore((state) => state.viewport);
  const panByScreenDelta = useUiStore((state) => state.panByScreenDelta);
  const setCursorWorld = useUiStore((state) => state.setCursorWorld);
  const zoomAt = useUiStore((state) => state.zoomAt);
  const draft = useDocumentStore((state) => state.draft);
  const entities = useDocumentStore((state) => state.entities);
  const selectedEntityId = useDocumentStore((state) => state.selectedEntityId);
  const cancelDraft = useDocumentStore((state) => state.cancelDraft);
  const cancelMeasurementDraft = useDocumentStore((state) => state.cancelMeasurementDraft);
  const commitDraft = useDocumentStore((state) => state.commitDraft);
  const commitMeasurementDraft = useDocumentStore((state) => state.commitMeasurementDraft);
  const measurementDraft = useDocumentStore((state) => state.measurementDraft);
  const measurements = useDocumentStore((state) => state.measurements);
  const selectEntity = useDocumentStore((state) => state.selectEntity);
  const startDraft = useDocumentStore((state) => state.startDraft);
  const startMeasurementDraft = useDocumentStore((state) => state.startMeasurementDraft);
  const updateDraft = useDocumentStore((state) => state.updateDraft);
  const updateMeasurementDraft = useDocumentStore((state) => state.updateMeasurementDraft);

  const bounds = useMemo(() => getVisibleWorldBounds(viewport, CANVAS_VIEWPORT_SIZE), [viewport]);
  const grid = useMemo(() => getGridModel(bounds, viewport.zoom), [bounds, viewport.zoom]);
  const worldTransform = toWorldTransform(viewport, CANVAS_VIEWPORT_SIZE);

  useEffect(() => {
    if (activeTool !== 'measure') {
      cancelMeasurementDraft();
    }
  }, [activeTool, cancelMeasurementDraft]);

  const updatePointer = (
    event: ReactPointerEvent<SVGSVGElement> | ReactWheelEvent<SVGSVGElement>
  ) => {
    const canvasPoint = toCanvasPoint(event);

    if (!canvasPoint) {
      return null;
    }

    const worldPoint = screenToWorld(
      canvasPoint,
      useUiStore.getState().viewport,
      CANVAS_VIEWPORT_SIZE
    );
    setCursorWorld(worldPoint);

    return {
      canvasPoint,
      worldPoint
    };
  };

  const shouldStartPan = (event: ReactPointerEvent<SVGSVGElement>) =>
    (activeTool === 'pan' && event.button === 0) || event.button === 1;

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const pointer = updatePointer(event);

    if (!pointer) {
      return;
    }

    if (shouldStartPan(event)) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      panRef.current = {
        lastPoint: pointer.canvasPoint,
        pointerId: event.pointerId
      };
      setIsPanning(true);
      return;
    }

    if (activeTool === 'select' && event.button === 0) {
      event.preventDefault();
      cancelMeasurementDraft();
      const hit = hitTestEntities(
        useDocumentStore.getState().entities,
        pointer.worldPoint,
        SELECTION_TOLERANCE_PX / useUiStore.getState().viewport.zoom
      );
      selectEntity(hit?.id ?? null);
      return;
    }

    if (activeTool === 'measure' && event.button === 0) {
      event.preventDefault();

      if (useDocumentStore.getState().measurementDraft) {
        updateMeasurementDraft(pointer.worldPoint);
        commitMeasurementDraft();
        return;
      }

      startMeasurementDraft(pointer.worldPoint);
      return;
    }

    if (!isDrawingTool(activeTool) || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = {
      pointerId: event.pointerId
    };
    startDraft(activeTool, pointer.worldPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const pointer = updatePointer(event);

    if (!pointer) {
      return;
    }

    const drawingState = drawingRef.current;

    if (drawingState?.pointerId === event.pointerId) {
      updateDraft(pointer.worldPoint);
      return;
    }

    const panState = panRef.current;

    if (activeTool === 'measure' && useDocumentStore.getState().measurementDraft) {
      updateMeasurementDraft(pointer.worldPoint);
      return;
    }

    if (!panState) {
      return;
    }

    panByScreenDelta({
      x: pointer.canvasPoint.x - panState.lastPoint.x,
      y: pointer.canvasPoint.y - panState.lastPoint.y
    });
    panState.lastPoint = pointer.canvasPoint;
  };

  const releasePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const stopPanning = (event: ReactPointerEvent<SVGSVGElement>) => {
    const panState = panRef.current;

    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }

    releasePointer(event);
    panRef.current = null;
    setIsPanning(false);
  };

  const finishDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drawingState = drawingRef.current;

    if (!drawingState || drawingState.pointerId !== event.pointerId) {
      return false;
    }

    const pointer = updatePointer(event);

    if (pointer) {
      updateDraft(pointer.worldPoint);
    }

    commitDraft();
    releasePointer(event);
    drawingRef.current = null;

    return true;
  };

  const cancelDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drawingState = drawingRef.current;

    if (!drawingState || drawingState.pointerId !== event.pointerId) {
      return;
    }

    cancelDraft();
    releasePointer(event);
    drawingRef.current = null;
  };

  const handlePointerCancel = (event: ReactPointerEvent<SVGSVGElement>) => {
    cancelDrawing(event);
    stopPanning(event);
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (finishDrawing(event)) {
      return;
    }

    stopPanning(event);
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    const pointer = updatePointer(event);

    if (!pointer) {
      return;
    }

    event.preventDefault();
    const nextZoom =
      useUiStore.getState().viewport.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY);
    zoomAt(pointer.canvasPoint, nextZoom);
  };

  const isMajorTick = (value: number) => Math.abs(value % grid.majorStep) < Number.EPSILON;
  const measurementPreview = measurementDraft
    ? createMeasurementFromDraft('measurement-preview', measurementDraft)
    : null;

  return (
    <section
      className="canvas-stage"
      aria-label="CAD 画布"
      data-panning={isPanning}
      data-tool={activeTool}
      role="img"
    >
      <svg
        className="cad-canvas"
        onLostPointerCapture={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_VIEWPORT_SIZE.width} ${CANVAS_VIEWPORT_SIZE.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          className="canvas-background"
          width={CANVAS_VIEWPORT_SIZE.width}
          height={CANVAS_VIEWPORT_SIZE.height}
        />

        <g transform={worldTransform}>
          {grid.xTicks.map((x) => (
            <line
              className={isMajorTick(x) ? 'major-grid-line' : 'grid-line'}
              key={`grid-x-${x}`}
              x1={x}
              x2={x}
              y1={bounds.minY}
              y2={bounds.maxY}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {grid.yTicks.map((y) => (
            <line
              className={isMajorTick(y) ? 'major-grid-line' : 'grid-line'}
              key={`grid-y-${y}`}
              x1={bounds.minX}
              x2={bounds.maxX}
              y1={y}
              y2={y}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <line
            x1={bounds.minX}
            y1="0"
            x2={bounds.maxX}
            y2="0"
            className="axis-line"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1={bounds.minY}
            x2="0"
            y2={bounds.maxY}
            className="axis-line"
            vectorEffect="non-scaling-stroke"
          />
          <circle className="origin-point" cx="0" cy="0" r={4 / viewport.zoom} />
          <CadEntities draft={draft} entities={entities} selectedEntityId={selectedEntityId} />
          <CadMeasurements
            measurements={measurements}
            preview={measurementPreview}
            zoom={viewport.zoom}
          />
        </g>
      </svg>
    </section>
  );
}
