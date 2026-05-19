import { getDistance } from './entities';
import type { Point } from '../geometry/viewport';

export type MeasurementDraft = {
  current: Point;
  start: Point;
};

export type DistanceMeasurement = {
  distance: number;
  end: Point;
  id: string;
  start: Point;
};

export const MIN_MEASUREMENT_DISTANCE = 1;

export const createMeasurementFromDraft = (
  id: string,
  draft: MeasurementDraft
): DistanceMeasurement | null => {
  const distance = getDistance(draft.start, draft.current);

  if (distance < MIN_MEASUREMENT_DISTANCE) {
    return null;
  }

  return {
    distance,
    end: draft.current,
    id,
    start: draft.start
  };
};

export const getMeasurementLabelPoint = (
  measurement: Pick<DistanceMeasurement, 'end' | 'start'>
) => ({
  x: (measurement.start.x + measurement.end.x) / 2,
  y: (measurement.start.y + measurement.end.y) / 2
});
