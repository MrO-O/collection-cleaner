import { describe, expect, it } from 'vitest';

import type { CollectionHistoryEntry, CollectionItem } from '../types/collection';
import {
  BackupValidationError,
  createBackup,
  parseBackupJson,
  summarizeBackup,
  validateBackup,
} from './backup';

const item: CollectionItem = {
  id: 'item-1',
  title: 'Backed up item',
  url: 'https://example.com/item',
  type: 'article',
  status: 'pending',
  reason: 'read_later',
  source: 'test',
  collectedAt: '2026-06-01T00:00:00.000Z',
  importance: 4,
  tags: ['backup'],
};

const historyEntry: CollectionHistoryEntry = {
  id: 'history-1',
  itemId: 'item-1',
  type: 'created',
  createdAt: '2026-06-01T00:00:00.000Z',
  note: 'Created collection item',
};

const exportedAt = new Date('2026-06-18T12:00:00.000Z');

describe('backup utilities', () => {
  it('creates a versioned backup with items and history', () => {
    const backup = createBackup([item], [historyEntry], exportedAt);

    expect(backup).toEqual({
      app: 'collection-cleaner',
      schemaVersion: 1,
      exportedAt: '2026-06-18T12:00:00.000Z',
      items: [item],
      history: [historyEntry],
    });
  });

  it('parses a valid backup', () => {
    const backup = createBackup([item], [historyEntry], exportedAt);

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseBackupJson('{not-json')).toThrow(
      new BackupValidationError('The selected file is not valid JSON.'),
    );
  });

  it('rejects a backup for another app', () => {
    const backup = { ...createBackup([], [], exportedAt), app: 'another-app' };

    expect(() => validateBackup(backup)).toThrow('not a collection-cleaner backup');
  });

  it('rejects an unsupported schema version', () => {
    const backup = { ...createBackup([], [], exportedAt), schemaVersion: 2 };

    expect(() => validateBackup(backup)).toThrow('Unsupported backup schemaVersion');
  });

  it('rejects items that are not an array', () => {
    const backup = { ...createBackup([], [], exportedAt), items: {} };

    expect(() => validateBackup(backup)).toThrow('Backup items must be an array');
  });

  it('rejects an item missing a required field', () => {
    const itemWithoutTitle: Partial<CollectionItem> = { ...item };
    delete itemWithoutTitle.title;
    const backup = { ...createBackup([], [], exportedAt), items: [itemWithoutTitle] };

    expect(() => validateBackup(backup)).toThrow('missing a valid title');
  });

  it('rejects unsupported item status and content type values', () => {
    const backup = createBackup([item], [], exportedAt);

    expect(() => validateBackup({ ...backup, items: [{ ...item, status: 'invalid' }] })).toThrow(
      'unsupported status',
    );
    expect(() => validateBackup({ ...backup, items: [{ ...item, type: 'invalid' }] })).toThrow(
      'unsupported type',
    );
  });

  it('keeps collection and history counts through export and import', () => {
    const exported = createBackup([item, { ...item, id: 'item-2' }], [historyEntry], exportedAt);
    const imported = parseBackupJson(JSON.stringify(exported));

    expect(imported.items).toHaveLength(2);
    expect(imported.history).toHaveLength(1);
    expect(summarizeBackup(imported)).toMatchObject({ itemCount: 2, historyCount: 1 });
  });

  it('preserves timeline history fields', () => {
    const imported = parseBackupJson(
      JSON.stringify(createBackup([item], [historyEntry], exportedAt)),
    );

    expect(imported.history[0]).toEqual(historyEntry);
  });

  it('rejects history when it is present but not an array', () => {
    const backup = { ...createBackup([item], [], exportedAt), history: {} };

    expect(() => validateBackup(backup)).toThrow('Backup history must be an array');
  });
});
