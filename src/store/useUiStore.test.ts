import { beforeEach, describe, expect, it } from 'vitest';
import { formatCoordinate, useUiStore } from './useUiStore';
import { createDefaultViewport } from '../geometry/viewport';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      activeTool: 'select',
      cursorWorld: { x: 0, y: 0 },
      viewport: createDefaultViewport()
    });
  });

  it('stores the active tool', () => {
    useUiStore.getState().setActiveTool('line');

    expect(useUiStore.getState().activeTool).toBe('line');
  });

  it('clamps zoom to the supported viewport range', () => {
    useUiStore.getState().setZoom(100);
    expect(useUiStore.getState().viewport.zoom).toBe(8);

    useUiStore.getState().setZoom(0.01);
    expect(useUiStore.getState().viewport.zoom).toBe(0.125);
  });

  it('formats world coordinates for the status bar', () => {
    expect(formatCoordinate(12.345)).toBe('12.35');
    expect(formatCoordinate(Number.NaN)).toBe('0.00');
  });

  it('updates the viewport center when panning by a screen delta', () => {
    useUiStore.getState().panByScreenDelta({ x: 80, y: -40 });

    expect(useUiStore.getState().viewport.center).toEqual({ x: -80, y: -40 });
  });

  it('fits the viewport to world bounds', () => {
    useUiStore.getState().fitToBounds({
      maxX: 120,
      maxY: 50,
      minX: -80,
      minY: -50
    });

    expect(useUiStore.getState().viewport).toEqual({
      center: { x: 20, y: 0 },
      zoom: 4.32
    });
  });
});
