import type { CadEntity } from '../cad/entities';
import type { DistanceMeasurement } from '../cad/measurements';

export const DOCUMENT_STORAGE_KEY = 'mini-cad-measure.document.v1';

export type PersistedDocument = {
  entities: CadEntity[];
  measurements: DistanceMeasurement[];
  nextEntityId: number;
  nextMeasurementId: number;
  version: 1;
};

type PersistableDocumentState = Omit<PersistedDocument, 'version'>;

const isPersistedDocument = (value: unknown): value is PersistedDocument => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedDocument>;

  return (
    candidate.version === 1 &&
    Array.isArray(candidate.entities) &&
    Array.isArray(candidate.measurements) &&
    typeof candidate.nextEntityId === 'number' &&
    typeof candidate.nextMeasurementId === 'number'
  );
};

export const serializeDocument = (state: PersistableDocumentState) =>
  JSON.stringify({
    entities: state.entities,
    measurements: state.measurements,
    nextEntityId: state.nextEntityId,
    nextMeasurementId: state.nextMeasurementId,
    version: 1
  } satisfies PersistedDocument);

export const parseDocument = (payload: string): PersistedDocument | null => {
  try {
    const parsed: unknown = JSON.parse(payload);

    return isPersistedDocument(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveDocumentToStorage = (
  storage: Pick<Storage, 'setItem'>,
  state: PersistableDocumentState
) => {
  storage.setItem(DOCUMENT_STORAGE_KEY, serializeDocument(state));
};

export const loadDocumentFromStorage = (storage: Pick<Storage, 'getItem'>) => {
  const payload = storage.getItem(DOCUMENT_STORAGE_KEY);

  return payload ? parseDocument(payload) : null;
};
