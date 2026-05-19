import {
  getDistance,
  normalizeRectangle,
  type CadEntity,
  type DrawingDraft
} from '../cad/entities';

type CadEntitiesProps = {
  draft: DrawingDraft | null;
  entities: CadEntity[];
  selectedEntityId: string | null;
};

type EntityShapeProps = {
  entity: CadEntity;
  isDraft?: boolean;
  isSelectionHalo?: boolean;
};

function EntityShape({ entity, isDraft = false, isSelectionHalo = false }: EntityShapeProps) {
  const className = [
    'cad-entity',
    isDraft ? 'cad-draft' : '',
    isSelectionHalo ? 'cad-selection-halo' : ''
  ]
    .filter(Boolean)
    .join(' ');
  const stroke = isSelectionHalo ? '#2563eb' : entity.stroke;
  const strokeWidth = isSelectionHalo ? entity.strokeWidth + 5 : entity.strokeWidth;
  const fill = isSelectionHalo ? 'none' : entity.fill;

  if (entity.type === 'line') {
    return (
      <line
        className={className}
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        x1={entity.start.x}
        x2={entity.end.x}
        y1={entity.start.y}
        y2={entity.end.y}
      />
    );
  }

  if (entity.type === 'rectangle') {
    return (
      <rect
        className={className}
        fill={fill}
        height={entity.height}
        stroke={stroke}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        width={entity.width}
        x={entity.x}
        y={entity.y}
      />
    );
  }

  return (
    <circle
      className={className}
      cx={entity.center.x}
      cy={entity.center.y}
      fill={fill}
      r={entity.radius}
      stroke={stroke}
      strokeWidth={strokeWidth}
      vectorEffect="non-scaling-stroke"
    />
  );
}

function draftToPreview(draft: DrawingDraft): CadEntity {
  const base = {
    fill: 'none',
    id: 'draft',
    stroke: '#0f766e',
    strokeWidth: 1.5
  };

  if (draft.tool === 'line') {
    return {
      ...base,
      end: draft.current,
      start: draft.start,
      type: 'line'
    };
  }

  if (draft.tool === 'rectangle') {
    return {
      ...base,
      ...normalizeRectangle(draft.start, draft.current),
      type: 'rectangle'
    };
  }

  return {
    ...base,
    center: draft.start,
    radius: getDistance(draft.start, draft.current),
    type: 'circle'
  };
}

export function CadEntities({ draft, entities, selectedEntityId }: CadEntitiesProps) {
  return (
    <g className="cad-entities">
      {entities.map((entity) => {
        const isSelected = entity.id === selectedEntityId;

        return (
          <g data-selected={isSelected} key={entity.id}>
            {isSelected ? <EntityShape entity={entity} isSelectionHalo /> : null}
            <EntityShape entity={entity} />
          </g>
        );
      })}
      {draft ? <EntityShape entity={draftToPreview(draft)} isDraft /> : null}
    </g>
  );
}
