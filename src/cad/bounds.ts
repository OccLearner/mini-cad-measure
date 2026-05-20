import type { CadEntity } from './entities';
import type { DistanceMeasurement } from './measurements';
import type { Point, WorldBounds } from '../geometry/viewport';

const getPointsBounds = (points: Point[]): WorldBounds => ({
  maxX: Math.max(...points.map((point) => point.x)),
  maxY: Math.max(...points.map((point) => point.y)),
  minX: Math.min(...points.map((point) => point.x)),
  minY: Math.min(...points.map((point) => point.y))
});

export const getEntityBounds = (entity: CadEntity): WorldBounds => {
  if (entity.type === 'line') {
    return getPointsBounds([entity.start, entity.end]);
  }

  if (entity.type === 'rectangle') {
    return {
      maxX: entity.x + entity.width,
      maxY: entity.y + entity.height,
      minX: entity.x,
      minY: entity.y
    };
  }

  return {
    maxX: entity.center.x + entity.radius,
    maxY: entity.center.y + entity.radius,
    minX: entity.center.x - entity.radius,
    minY: entity.center.y - entity.radius
  };
};

export const getMeasurementBounds = (measurement: DistanceMeasurement): WorldBounds =>
  getPointsBounds([measurement.start, measurement.end]);

export const mergeWorldBounds = (bounds: WorldBounds[]): WorldBounds | null => {
  if (bounds.length === 0) {
    return null;
  }

  return {
    maxX: Math.max(...bounds.map((bound) => bound.maxX)),
    maxY: Math.max(...bounds.map((bound) => bound.maxY)),
    minX: Math.min(...bounds.map((bound) => bound.minX)),
    minY: Math.min(...bounds.map((bound) => bound.minY))
  };
};

export const getDocumentBounds = (
  entities: CadEntity[],
  measurements: DistanceMeasurement[]
): WorldBounds | null =>
  mergeWorldBounds([
    ...entities.map((entity) => getEntityBounds(entity)),
    ...measurements.map((measurement) => getMeasurementBounds(measurement))
  ]);
