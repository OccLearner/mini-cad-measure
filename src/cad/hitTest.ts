import type { CadEntity } from './entities';
import type { Point } from '../geometry/viewport';

const isInsideBounds = (
  point: Point,
  bounds: { maxX: number; maxY: number; minX: number; minY: number },
  tolerance: number
) =>
  point.x >= bounds.minX - tolerance &&
  point.x <= bounds.maxX + tolerance &&
  point.y >= bounds.minY - tolerance &&
  point.y <= bounds.maxY + tolerance;

export const getPointToSegmentDistance = (point: Point, start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
  );
  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy
  };

  return Math.hypot(point.x - projection.x, point.y - projection.y);
};

export const hitTestEntity = (entity: CadEntity, point: Point, tolerance: number) => {
  if (entity.type === 'line') {
    return getPointToSegmentDistance(point, entity.start, entity.end) <= tolerance;
  }

  if (entity.type === 'rectangle') {
    return isInsideBounds(
      point,
      {
        maxX: entity.x + entity.width,
        maxY: entity.y + entity.height,
        minX: entity.x,
        minY: entity.y
      },
      tolerance
    );
  }

  return (
    Math.hypot(point.x - entity.center.x, point.y - entity.center.y) <= entity.radius + tolerance
  );
};

export const hitTestEntities = (entities: CadEntity[], point: Point, tolerance: number) => {
  for (let index = entities.length - 1; index >= 0; index -= 1) {
    const entity = entities[index];

    if (hitTestEntity(entity, point, tolerance)) {
      return entity;
    }
  }

  return null;
};
