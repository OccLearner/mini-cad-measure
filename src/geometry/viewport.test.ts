import { describe, expect, it } from 'vitest';
import {
  CANVAS_VIEWPORT_SIZE,
  clampZoom,
  createDefaultViewport,
  fitViewportToWorldBounds,
  getVisibleWorldBounds,
  panViewportByScreenDelta,
  screenToWorld,
  worldToScreen,
  zoomViewportAt
} from './viewport';

describe('viewport math', () => {
  it('maps the viewport center to world origin by default', () => {
    const viewport = createDefaultViewport();

    expect(screenToWorld({ x: 480, y: 320 }, viewport, CANVAS_VIEWPORT_SIZE)).toEqual({
      x: 0,
      y: 0
    });
  });

  it('round-trips world and screen coordinates', () => {
    const viewport = {
      center: { x: 20, y: -10 },
      zoom: 2
    };
    const worldPoint = { x: 42, y: 16 };

    const screenPoint = worldToScreen(worldPoint, viewport, CANVAS_VIEWPORT_SIZE);

    expect(screenToWorld(screenPoint, viewport, CANVAS_VIEWPORT_SIZE)).toEqual(worldPoint);
  });

  it('keeps the zoom anchor under the same screen point', () => {
    const viewport = createDefaultViewport();
    const anchor = { x: 720, y: 120 };
    const worldBefore = screenToWorld(anchor, viewport, CANVAS_VIEWPORT_SIZE);

    const nextViewport = zoomViewportAt(anchor, 2, viewport, CANVAS_VIEWPORT_SIZE);

    expect(screenToWorld(anchor, nextViewport, CANVAS_VIEWPORT_SIZE)).toEqual(worldBefore);
  });

  it('pans opposite the drag direction on the horizontal axis', () => {
    const viewport = createDefaultViewport();

    expect(panViewportByScreenDelta(viewport, { x: 100, y: 50 }).center).toEqual({
      x: -100,
      y: 50
    });
  });

  it('returns visible world bounds with y-up coordinates', () => {
    expect(getVisibleWorldBounds(createDefaultViewport(), CANVAS_VIEWPORT_SIZE)).toEqual({
      minX: -480,
      maxX: 480,
      minY: -320,
      maxY: 320
    });
  });

  it('clamps invalid and out-of-range zoom values', () => {
    expect(clampZoom(100)).toBe(8);
    expect(clampZoom(0.01)).toBe(0.125);
    expect(clampZoom(Number.NaN)).toBe(1);
  });

  it('fits the viewport around world bounds with padding', () => {
    expect(
      fitViewportToWorldBounds(
        {
          maxX: 120,
          maxY: 50,
          minX: -80,
          minY: -50
        },
        CANVAS_VIEWPORT_SIZE,
        40
      )
    ).toEqual({
      center: { x: 20, y: 0 },
      zoom: 4.4
    });
  });

  it('falls back to the default viewport when fitting empty content', () => {
    expect(fitViewportToWorldBounds(null, CANVAS_VIEWPORT_SIZE)).toEqual(createDefaultViewport());
  });
});
