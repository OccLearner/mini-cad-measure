import { describe, expect, it } from 'vitest';
import { DEFAULT_ENTITY_STYLE } from './entities';
import {
  getDocumentBounds,
  getEntityBounds,
  getMeasurementBounds,
  mergeWorldBounds
} from './bounds';

describe('bounds', () => {
  it('calculates entity bounds for supported shapes', () => {
    expect(
      getEntityBounds({
        ...DEFAULT_ENTITY_STYLE,
        end: { x: 12, y: -4 },
        id: 'line',
        start: { x: -2, y: 5 },
        type: 'line'
      })
    ).toEqual({
      maxX: 12,
      maxY: 5,
      minX: -2,
      minY: -4
    });

    expect(
      getEntityBounds({
        ...DEFAULT_ENTITY_STYLE,
        center: { x: 10, y: 20 },
        id: 'circle',
        radius: 6,
        type: 'circle'
      })
    ).toEqual({
      maxX: 16,
      maxY: 26,
      minX: 4,
      minY: 14
    });
  });

  it('calculates measurement bounds from endpoints', () => {
    expect(
      getMeasurementBounds({
        distance: 10,
        end: { x: 3, y: 7 },
        id: 'measurement',
        start: { x: -5, y: -2 }
      })
    ).toEqual({
      maxX: 3,
      maxY: 7,
      minX: -5,
      minY: -2
    });
  });

  it('merges document bounds across entities and measurements', () => {
    const bounds = getDocumentBounds(
      [
        {
          ...DEFAULT_ENTITY_STYLE,
          height: 8,
          id: 'rect',
          type: 'rectangle',
          width: 12,
          x: 2,
          y: -3
        }
      ],
      [
        {
          distance: 10,
          end: { x: -20, y: 5 },
          id: 'measurement',
          start: { x: -8, y: 1 }
        }
      ]
    );

    expect(bounds).toEqual({
      maxX: 14,
      maxY: 5,
      minX: -20,
      minY: -3
    });
  });

  it('returns null for empty bounds lists', () => {
    expect(mergeWorldBounds([])).toBeNull();
    expect(getDocumentBounds([], [])).toBeNull();
  });
});
