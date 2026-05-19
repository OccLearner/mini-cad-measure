import { describe, expect, it, vi } from 'vitest';
import {
  DOCUMENT_STORAGE_KEY,
  loadDocumentFromStorage,
  parseDocument,
  saveDocumentToStorage,
  serializeDocument
} from './documentPersistence';

describe('document persistence', () => {
  const document = {
    entities: [],
    measurements: [],
    nextEntityId: 2,
    nextMeasurementId: 3
  };

  it('serializes and parses persisted documents', () => {
    expect(parseDocument(serializeDocument(document))).toEqual({
      ...document,
      version: 1
    });
  });

  it('returns null for invalid payloads', () => {
    expect(parseDocument('{bad json')).toBeNull();
    expect(parseDocument(JSON.stringify({ version: 2 }))).toBeNull();
  });

  it('saves and loads through storage', () => {
    const storage = {
      payload: '',
      getItem: vi.fn(() => storage.payload),
      setItem: vi.fn((key: string, value: string) => {
        storage.payload = value;
      })
    };

    saveDocumentToStorage(storage, document);

    expect(storage.setItem).toHaveBeenCalledWith(DOCUMENT_STORAGE_KEY, expect.any(String));
    expect(loadDocumentFromStorage(storage)).toEqual({
      ...document,
      version: 1
    });
  });
});
