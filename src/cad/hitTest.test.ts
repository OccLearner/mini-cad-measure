import { describe, expect, it } from 'vitest';
import { DEFAULT_ENTITY_STYLE, type CadEntity } from './entities';
import { getPointToSegmentDistance, hitTestEntities, hitTestEntity } from './hitTest';

describe('hit testing', () => {
  it('measures the shortest distance from a point to a segment', () => {
    expect(getPointToSegmentDistance({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
  });

  it('hits a line within tolerance', () => {
    expect(
      hitTestEntity(
        {
          ...DEFAULT_ENTITY_STYLE,
          end: { x: 20, y: 0 },
          id: 'line',
          start: { x: 0, y: 0 },
          type: 'line'
        },
        { x: 10, y: 2 },
        3
      )
    ).toBe(true);
  });

  it('hits rectangle and circle extents', () => {
    expect(
      hitTestEntity(
        {
          ...DEFAULT_ENTITY_STYLE,
          height: 10,
          id: 'rect',
          type: 'rectangle',
          width: 20,
          x: -5,
          y: -5
        },
        { x: 10, y: 0 },
        0
      )
    ).toBe(true);

    expect(
      hitTestEntity(
        {
          ...DEFAULT_ENTITY_STYLE,
          center: { x: 0, y: 0 },
          id: 'circle',
          radius: 5,
          type: 'circle'
        },
        { x: 4, y: 0 },
        0
      )
    ).toBe(true);
  });

  it('returns the topmost hit entity', () => {
    const entities: CadEntity[] = [
      {
        ...DEFAULT_ENTITY_STYLE,
        end: { x: 20, y: 0 },
        id: 'bottom',
        start: { x: 0, y: 0 },
        type: 'line'
      },
      {
        ...DEFAULT_ENTITY_STYLE,
        center: { x: 10, y: 0 },
        id: 'top',
        radius: 8,
        type: 'circle'
      }
    ];

    expect(hitTestEntities(entities, { x: 10, y: 0 }, 2)?.id).toBe('top');
  });
});
