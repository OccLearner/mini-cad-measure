import { beforeEach, describe, expect, it } from 'vitest';
import { useDocumentStore } from './useDocumentStore';

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().clearDocument();
  });

  it('commits valid drawing drafts as entities', () => {
    useDocumentStore.getState().startDraft('rectangle', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 8, y: 4 });

    const entity = useDocumentStore.getState().commitDraft();

    expect(entity).toMatchObject({
      height: 4,
      id: 'entity-0001',
      type: 'rectangle',
      width: 8
    });
    expect(useDocumentStore.getState().entities).toHaveLength(1);
    expect(useDocumentStore.getState().draft).toBeNull();
    expect(useDocumentStore.getState().selectedEntityId).toBe('entity-0001');
  });

  it('drops invalid drafts without creating entities', () => {
    useDocumentStore.getState().startDraft('circle', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 0.5, y: 0 });

    expect(useDocumentStore.getState().commitDraft()).toBeNull();
    expect(useDocumentStore.getState().entities).toHaveLength(0);
  });

  it('assigns stable incrementing ids', () => {
    useDocumentStore.getState().startDraft('line', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 10, y: 0 });
    useDocumentStore.getState().commitDraft();

    useDocumentStore.getState().startDraft('line', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 0, y: 10 });
    useDocumentStore.getState().commitDraft();

    expect(useDocumentStore.getState().entities.map((entity) => entity.id)).toEqual([
      'entity-0001',
      'entity-0002'
    ]);
  });

  it('selects and updates entity styles', () => {
    useDocumentStore.getState().startDraft('line', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 10, y: 0 });
    useDocumentStore.getState().commitDraft();

    useDocumentStore.getState().selectEntity('entity-0001');
    useDocumentStore.getState().updateEntityStyle('entity-0001', {
      stroke: '#2563eb',
      strokeWidth: 3
    });

    expect(useDocumentStore.getState().selectedEntityId).toBe('entity-0001');
    expect(useDocumentStore.getState().entities[0]).toMatchObject({
      stroke: '#2563eb',
      strokeWidth: 3
    });
  });

  it('clears invalid selections', () => {
    useDocumentStore.getState().selectEntity('missing');

    expect(useDocumentStore.getState().selectedEntityId).toBeNull();
  });

  it('commits distance measurements', () => {
    useDocumentStore.getState().startMeasurementDraft({ x: 0, y: 0 });
    useDocumentStore.getState().updateMeasurementDraft({ x: 3, y: 4 });

    const measurement = useDocumentStore.getState().commitMeasurementDraft();

    expect(measurement).toMatchObject({
      distance: 5,
      id: 'measurement-0001'
    });
    expect(useDocumentStore.getState().measurements).toHaveLength(1);
  });

  it('undoes and redoes document mutations', () => {
    useDocumentStore.getState().startDraft('line', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 10, y: 0 });
    useDocumentStore.getState().commitDraft();

    expect(useDocumentStore.getState().entities).toHaveLength(1);

    useDocumentStore.getState().undo();
    expect(useDocumentStore.getState().entities).toHaveLength(0);
    expect(useDocumentStore.getState().redoStack).toHaveLength(1);

    useDocumentStore.getState().redo();
    expect(useDocumentStore.getState().entities).toHaveLength(1);
  });

  it('persists and loads local documents', () => {
    const storage = {
      payload: '',
      getItem: () => storage.payload,
      setItem: (_key: string, value: string) => {
        storage.payload = value;
      }
    };

    useDocumentStore.getState().startDraft('line', { x: 0, y: 0 });
    useDocumentStore.getState().updateDraft({ x: 10, y: 0 });
    useDocumentStore.getState().commitDraft();

    expect(useDocumentStore.getState().saveLocalDocument(storage)).toBe(true);

    useDocumentStore.getState().clearDocument();
    expect(useDocumentStore.getState().entities).toHaveLength(0);

    expect(useDocumentStore.getState().loadLocalDocument(storage)).toBe(true);
    expect(useDocumentStore.getState().entities).toHaveLength(1);
    expect(useDocumentStore.getState().saveStatus).toBe('loaded');
  });
});
