import { describe, expect, it } from 'vitest';
import { createMeasurementFromDraft, getMeasurementLabelPoint } from './measurements';

describe('measurements', () => {
  it('creates a distance measurement from two points', () => {
    expect(
      createMeasurementFromDraft('measurement-0001', {
        current: { x: 3, y: 4 },
        start: { x: 0, y: 0 }
      })
    ).toEqual({
      distance: 5,
      end: { x: 3, y: 4 },
      id: 'measurement-0001',
      start: { x: 0, y: 0 }
    });
  });

  it('rejects tiny measurements', () => {
    expect(
      createMeasurementFromDraft('measurement-0001', {
        current: { x: 0.5, y: 0 },
        start: { x: 0, y: 0 }
      })
    ).toBeNull();
  });

  it('places labels at the midpoint', () => {
    expect(
      getMeasurementLabelPoint({
        end: { x: 10, y: -4 },
        start: { x: 0, y: 2 }
      })
    ).toEqual({ x: 5, y: -1 });
  });
});
