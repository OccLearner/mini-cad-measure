import { useEffect } from 'react';
import { useDocumentStore } from '../store/useDocumentStore';
import { type ToolId, useUiStore } from '../store/useUiStore';

const toolShortcutMap: Partial<Record<string, ToolId>> = {
  c: 'circle',
  d: 'measure',
  h: 'pan',
  l: 'line',
  r: 'rectangle',
  v: 'select'
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
};

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const isUndoRedoKey = (event.ctrlKey || event.metaKey) && key === 'z';

      if (isUndoRedoKey && event.shiftKey) {
        event.preventDefault();
        useDocumentStore.getState().redo();
        return;
      }

      if (isUndoRedoKey) {
        event.preventDefault();
        useDocumentStore.getState().undo();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && key === 'y') {
        event.preventDefault();
        useDocumentStore.getState().redo();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        useDocumentStore.getState().cancelDraft();
        useDocumentStore.getState().cancelMeasurementDraft();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        useDocumentStore.getState().deleteSelectedEntity();
        return;
      }

      const nextTool = toolShortcutMap[key];

      if (nextTool) {
        event.preventDefault();
        useUiStore.getState().setActiveTool(nextTool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
