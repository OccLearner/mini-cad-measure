import { create } from 'zustand';
import {
  createEntityFromDraft,
  type CadEntity,
  type DrawingDraft,
  type DrawingTool,
  type EntityStyle
} from '../cad/entities';
import {
  createMeasurementFromDraft,
  type DistanceMeasurement,
  type MeasurementDraft
} from '../cad/measurements';
import type { Point } from '../geometry/viewport';
import { loadDocumentFromStorage, saveDocumentToStorage } from './documentPersistence';

type DocumentSnapshot = {
  entities: CadEntity[];
  measurements: DistanceMeasurement[];
  nextEntityId: number;
  nextMeasurementId: number;
  selectedEntityId: string | null;
};

type SaveStatus = 'idle' | 'saved' | 'loaded' | 'error' | 'empty';

type DocumentState = DocumentSnapshot & {
  draft: DrawingDraft | null;
  measurementDraft: MeasurementDraft | null;
  redoStack: DocumentSnapshot[];
  saveStatus: SaveStatus;
  undoStack: DocumentSnapshot[];
  cancelDraft: () => void;
  cancelMeasurementDraft: () => void;
  clearDocument: () => void;
  commitDraft: () => CadEntity | null;
  commitMeasurementDraft: () => DistanceMeasurement | null;
  loadLocalDocument: (storage?: Pick<Storage, 'getItem'>) => boolean;
  redo: () => void;
  saveLocalDocument: (storage?: Pick<Storage, 'setItem'>) => boolean;
  selectEntity: (id: string | null) => void;
  startDraft: (tool: DrawingTool, start: Point) => void;
  startMeasurementDraft: (start: Point) => void;
  undo: () => void;
  updateDraft: (current: Point) => void;
  updateEntityStyle: (id: string, style: Partial<EntityStyle>) => void;
  updateMeasurementDraft: (current: Point) => void;
};

const createId = (value: number) => `entity-${String(value).padStart(4, '0')}`;
const createMeasurementId = (value: number) => `measurement-${String(value).padStart(4, '0')}`;
const HISTORY_LIMIT = 100;

const initialSnapshot = (): DocumentSnapshot => ({
  entities: [],
  measurements: [],
  nextEntityId: 1,
  nextMeasurementId: 1,
  selectedEntityId: null
});

const snapshotDocument = (state: DocumentState): DocumentSnapshot => ({
  entities: state.entities,
  measurements: state.measurements,
  nextEntityId: state.nextEntityId,
  nextMeasurementId: state.nextMeasurementId,
  selectedEntityId: state.selectedEntityId
});

const pushUndo = (state: DocumentState) => [
  ...state.undoStack.slice(Math.max(0, state.undoStack.length - HISTORY_LIMIT + 1)),
  snapshotDocument(state)
];

const getBrowserStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const useDocumentStore = create<DocumentState>((set, get) => ({
  ...initialSnapshot(),
  draft: null,
  measurementDraft: null,
  redoStack: [],
  saveStatus: 'idle',
  undoStack: [],
  cancelDraft: () => set({ draft: null }),
  cancelMeasurementDraft: () => set({ measurementDraft: null }),
  clearDocument: () =>
    set({
      ...initialSnapshot(),
      draft: null,
      measurementDraft: null,
      redoStack: [],
      saveStatus: 'idle',
      undoStack: []
    }),
  commitDraft: () => {
    const { draft, nextEntityId } = get();

    if (!draft) {
      return null;
    }

    const entity = createEntityFromDraft(createId(nextEntityId), draft);

    if (!entity) {
      set({ draft: null });
      return null;
    }

    set((state) => ({
      draft: null,
      entities: [...state.entities, entity],
      nextEntityId: state.nextEntityId + 1,
      redoStack: [],
      saveStatus: 'idle',
      selectedEntityId: entity.id,
      undoStack: pushUndo(state)
    }));

    return entity;
  },
  commitMeasurementDraft: () => {
    const { measurementDraft, nextMeasurementId } = get();

    if (!measurementDraft) {
      return null;
    }

    const measurement = createMeasurementFromDraft(
      createMeasurementId(nextMeasurementId),
      measurementDraft
    );

    if (!measurement) {
      set({ measurementDraft: null });
      return null;
    }

    set((state) => ({
      measurementDraft: null,
      measurements: [...state.measurements, measurement],
      nextMeasurementId: state.nextMeasurementId + 1,
      redoStack: [],
      saveStatus: 'idle',
      selectedEntityId: null,
      undoStack: pushUndo(state)
    }));

    return measurement;
  },
  loadLocalDocument: (storage) => {
    const targetStorage = storage ?? getBrowserStorage();

    if (!targetStorage) {
      set({ saveStatus: 'error' });
      return false;
    }

    const persisted = loadDocumentFromStorage(targetStorage);

    if (!persisted) {
      set({ saveStatus: 'empty' });
      return false;
    }

    set({
      draft: null,
      entities: persisted.entities,
      measurementDraft: null,
      measurements: persisted.measurements,
      nextEntityId: persisted.nextEntityId,
      nextMeasurementId: persisted.nextMeasurementId,
      redoStack: [],
      saveStatus: 'loaded',
      selectedEntityId: null,
      undoStack: []
    });

    return true;
  },
  redo: () =>
    set((state) => {
      const next = state.redoStack.at(-1);

      if (!next) {
        return {};
      }

      return {
        ...next,
        draft: null,
        measurementDraft: null,
        redoStack: state.redoStack.slice(0, -1),
        saveStatus: 'idle',
        undoStack: [...state.undoStack, snapshotDocument(state)]
      };
    }),
  saveLocalDocument: (storage) => {
    const targetStorage = storage ?? getBrowserStorage();

    if (!targetStorage) {
      set({ saveStatus: 'error' });
      return false;
    }

    try {
      const state = get();

      saveDocumentToStorage(targetStorage, {
        entities: state.entities,
        measurements: state.measurements,
        nextEntityId: state.nextEntityId,
        nextMeasurementId: state.nextMeasurementId
      });
      set({ saveStatus: 'saved' });
      return true;
    } catch {
      set({ saveStatus: 'error' });
      return false;
    }
  },
  selectEntity: (id) =>
    set((state) => ({
      selectedEntityId: id && state.entities.some((entity) => entity.id === id) ? id : null
    })),
  startDraft: (tool, start) =>
    set({
      draft: {
        current: start,
        start,
        tool
      },
      measurementDraft: null,
      selectedEntityId: null
    }),
  startMeasurementDraft: (start) =>
    set({
      draft: null,
      measurementDraft: {
        current: start,
        start
      },
      selectedEntityId: null
    }),
  undo: () =>
    set((state) => {
      const previous = state.undoStack.at(-1);

      if (!previous) {
        return {};
      }

      return {
        ...previous,
        draft: null,
        measurementDraft: null,
        redoStack: [...state.redoStack, snapshotDocument(state)],
        saveStatus: 'idle',
        undoStack: state.undoStack.slice(0, -1)
      };
    }),
  updateDraft: (current) =>
    set((state) => {
      if (!state.draft) {
        return {};
      }

      return {
        draft: {
          ...state.draft,
          current
        }
      };
    }),
  updateEntityStyle: (id, style) =>
    set((state) => {
      const target = state.entities.find((entity) => entity.id === id);

      if (!target) {
        return {};
      }

      const hasChange = Object.entries(style).some(([key, value]) => {
        const typedKey = key as keyof EntityStyle;

        return target[typedKey] !== value;
      });

      if (!hasChange) {
        return {};
      }

      return {
        entities: state.entities.map((entity) =>
          entity.id === id
            ? {
                ...entity,
                ...style
              }
            : entity
        ),
        redoStack: [],
        saveStatus: 'idle',
        undoStack: pushUndo(state)
      };
    }),
  updateMeasurementDraft: (current) =>
    set((state) => {
      if (!state.measurementDraft) {
        return {};
      }

      return {
        measurementDraft: {
          ...state.measurementDraft,
          current
        }
      };
    })
}));
