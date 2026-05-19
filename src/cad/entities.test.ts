import { describe, expect, it } from 'vitest';
import { createEntityFromDraft, isDrawingTool, normalizeRectangle } from './entities';

describe('cad entities', () => {
  it('detects drawing tools', () => {
    expect(isDrawingTool('line')).toBe(true);
    expect(isDrawingTool('measure')).toBe(false);
  });

  it('creates a line entity from a valid draft', () => {
    expect(
      createEntityFromDraft('entity-1', {
        current: { x: 10, y: 0 },
        start: { x: 0, y: 0 },
        tool: 'line'
      })
    ).toMatchObject({
      end: { x: 10, y: 0 },
      id: 'entity-1',
      start: { x: 0, y: 0 },
      type: 'line'
    });
  });

  it('normalizes rectangles from any drag direction', () => {
    expect(normalizeRectangle({ x: 10, y: -5 }, { x: -2, y: 4 })).toEqual({
      height: 9,
      width: 12,
      x: -2,
      y: -5
    });
  });

  it('rejects tiny drafts', () => {
    expect(
      createEntityFromDraft('entity-1', {
        current: { x: 0.5, y: 0 },
        start: { x: 0, y: 0 },
        tool: 'line'
      })
    ).toBeNull();
  });

  it('creates a circle with the drag distance as radius', () => {
    expect(
      createEntityFromDraft('entity-1', {
        current: { x: 3, y: 4 },
        start: { x: 0, y: 0 },
        tool: 'circle'
      })
    ).toMatchObject({
      center: { x: 0, y: 0 },
      radius: 5,
      type: 'circle'
    });
  });
});
