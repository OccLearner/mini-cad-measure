import { getDistance, type CadEntity } from '../cad/entities';
import { useDocumentStore } from '../store/useDocumentStore';
import { formatCoordinate } from '../store/useUiStore';

const entityTypeLabels = {
  circle: '圆',
  line: '直线',
  rectangle: '矩形'
} satisfies Record<CadEntity['type'], string>;

const clampStrokeWidth = (value: number) => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(20, Math.max(0.5, value));
};

function GeometryProperties({ entity }: { entity: CadEntity }) {
  if (entity.type === 'line') {
    return (
      <>
        <div>
          <dt>起点</dt>
          <dd>
            {formatCoordinate(entity.start.x)}, {formatCoordinate(entity.start.y)}
          </dd>
        </div>
        <div>
          <dt>终点</dt>
          <dd>
            {formatCoordinate(entity.end.x)}, {formatCoordinate(entity.end.y)}
          </dd>
        </div>
        <div>
          <dt>长度</dt>
          <dd>{formatCoordinate(getDistance(entity.start, entity.end))}</dd>
        </div>
      </>
    );
  }

  if (entity.type === 'rectangle') {
    return (
      <>
        <div>
          <dt>位置</dt>
          <dd>
            {formatCoordinate(entity.x)}, {formatCoordinate(entity.y)}
          </dd>
        </div>
        <div>
          <dt>宽度</dt>
          <dd>{formatCoordinate(entity.width)}</dd>
        </div>
        <div>
          <dt>高度</dt>
          <dd>{formatCoordinate(entity.height)}</dd>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <dt>圆心</dt>
        <dd>
          {formatCoordinate(entity.center.x)}, {formatCoordinate(entity.center.y)}
        </dd>
      </div>
      <div>
        <dt>半径</dt>
        <dd>{formatCoordinate(entity.radius)}</dd>
      </div>
    </>
  );
}

export function PropertiesPanel() {
  const entities = useDocumentStore((state) => state.entities);
  const selectedEntityId = useDocumentStore((state) => state.selectedEntityId);
  const updateEntityStyle = useDocumentStore((state) => state.updateEntityStyle);
  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId) ?? null;

  return (
    <aside className="properties-panel" aria-label="属性面板">
      <div className="panel-header">
        <h2>属性</h2>
      </div>

      {selectedEntity ? (
        <dl className="property-list">
          <div>
            <dt>对象</dt>
            <dd>{entityTypeLabels[selectedEntity.type]}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>{selectedEntity.id}</dd>
          </div>
          <GeometryProperties entity={selectedEntity} />
          <div>
            <dt>线宽</dt>
            <dd>
              <input
                aria-label="线宽"
                className="property-number-input"
                max="20"
                min="0.5"
                onChange={(event) =>
                  updateEntityStyle(selectedEntity.id, {
                    strokeWidth: clampStrokeWidth(event.currentTarget.valueAsNumber)
                  })
                }
                step="0.5"
                type="number"
                value={selectedEntity.strokeWidth}
              />
              px
            </dd>
          </div>
          <div>
            <dt>颜色</dt>
            <dd>
              <input
                aria-label="线色"
                className="property-color-input"
                onChange={(event) =>
                  updateEntityStyle(selectedEntity.id, {
                    stroke: event.currentTarget.value
                  })
                }
                type="color"
                value={selectedEntity.stroke}
              />
              <span>{selectedEntity.stroke}</span>
            </dd>
          </div>
        </dl>
      ) : (
        <div className="empty-properties">未选择对象</div>
      )}
    </aside>
  );
}
