import { getMeasurementLabelPoint, type DistanceMeasurement } from '../cad/measurements';
import { formatCoordinate } from '../store/useUiStore';

type CadMeasurementsProps = {
  measurements: DistanceMeasurement[];
  preview: DistanceMeasurement | null;
  zoom: number;
};

function MeasurementShape({
  measurement,
  isPreview = false,
  zoom
}: {
  isPreview?: boolean;
  measurement: DistanceMeasurement;
  zoom: number;
}) {
  const labelPoint = getMeasurementLabelPoint(measurement);
  const labelOffset = 10 / zoom;
  const label = formatCoordinate(measurement.distance);

  return (
    <g className={isPreview ? 'cad-measurement cad-measurement-preview' : 'cad-measurement'}>
      <line
        className="cad-measurement-line"
        vectorEffect="non-scaling-stroke"
        x1={measurement.start.x}
        x2={measurement.end.x}
        y1={measurement.start.y}
        y2={measurement.end.y}
      />
      <circle
        className="cad-measurement-point"
        cx={measurement.start.x}
        cy={measurement.start.y}
        r={4 / zoom}
      />
      <circle
        className="cad-measurement-point"
        cx={measurement.end.x}
        cy={measurement.end.y}
        r={4 / zoom}
      />
      <text
        className="cad-measurement-label"
        transform={`translate(${labelPoint.x} ${labelPoint.y + labelOffset}) scale(${1 / zoom} ${-1 / zoom})`}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

export function CadMeasurements({ measurements, preview, zoom }: CadMeasurementsProps) {
  return (
    <g className="cad-measurements">
      {measurements.map((measurement) => (
        <MeasurementShape key={measurement.id} measurement={measurement} zoom={zoom} />
      ))}
      {preview ? <MeasurementShape isPreview measurement={preview} zoom={zoom} /> : null}
    </g>
  );
}
