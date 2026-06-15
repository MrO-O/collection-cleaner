import 'fake-indexeddb/auto';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { CollectionHistoryEntry, CollectionItem } from '../types/collection';
import { createCollectionsDb, type CollectionsDb } from './collectionsDb';
import { createCollectionsRepository, type CollectionsRepository } from './collectionsRepository';

let db: CollectionsDb;
let repository: CollectionsRepository;
let dbCounter = 0;

const baseItem: CollectionItem = {
  id: 'item-1',
  title: 'Persistent item',
  url: 'https://example.com',
  type: 'article',
  status: 'pending',
  reason: 'read_later',
  source: 'test',
  collectedAt: '2026-06-01T00:00:00.000Z',
  importance: 3,
  tags: ['test'],
};

const openedEvent: CollectionHistoryEntry = {
  id: 'event-1',
  itemId: 'item-1',
  type: 'opened',
  createdAt: '2026-06-15T10:00:00.000Z',
  note: 'Opened link',
};

beforeEach(() => {
  dbCounter += 1;
  db = createCollectionsDb(`collection-cleaner-test-${dbCounter}`);
  repository = createCollectionsRepository(db);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe('collectionsRepository', () => {
  it('seeds mock data when the database is empty', async () => {
    const seeded = await repository.seedCollectionsIfEmpty([baseItem]);
    const items = await repository.getAllCollections();

    expect(seeded).toBe(true);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-1');
  });

  it('does not seed mock data twice when data already exists', async () => {
    await repository.seedCollectionsIfEmpty([baseItem]);

    const seededAgain = await repository.seedCollectionsIfEmpty([
      { ...baseItem, id: 'item-2', title: 'Duplicate seed candidate' },
    ]);
    const items = await repository.getAllCollections();

    expect(seededAgain).toBe(false);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-1');
  });

  it('persists status updates', async () => {
    await repository.saveCollection(baseItem);

    await repository.updateCollectionStatus('item-1', 'processed', {
      processedAt: '2026-06-15T10:00:00.000Z',
    });
    const item = await repository.getCollectionById('item-1');

    expect(item?.status).toBe('processed');
    expect(item?.processedAt).toBe('2026-06-15T10:00:00.000Z');
  });

  it('persists appended history entries', async () => {
    await repository.saveCollection(baseItem);

    await repository.appendCollectionHistory(openedEvent);
    const history = await repository.getCollectionHistory('item-1');

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ id: 'event-1', type: 'opened' });
  });

  it('persists postponed action results', async () => {
    await repository.saveCollection(baseItem);

    await repository.persistCollectionAction(
      { items: [baseItem], history: [] },
      {
        type: 'postponeItem',
        itemId: 'item-1',
        at: '2026-06-15T10:00:00.000Z',
        eventId: 'event-postpone',
        days: 7,
      },
    );
    const item = await repository.getCollectionById('item-1');
    const history = await repository.getCollectionHistory('item-1');

    expect(item?.expiresAt).toBe('2026-06-22T10:00:00.000Z');
    expect(history[0].type).toBe('postponed');
  });

  it('handles actions for missing items without throwing', async () => {
    await repository.saveCollection(baseItem);

    const nextState = await repository.persistCollectionAction(
      { items: [baseItem], history: [] },
      {
        type: 'deleteItem',
        itemId: 'missing',
        at: '2026-06-15T10:00:00.000Z',
        eventId: 'event-missing',
      },
    );
    const items = await repository.getAllCollections();
    const history = await repository.getAllCollectionHistory();

    expect(nextState.items[0].status).toBe('pending');
    expect(items[0].status).toBe('pending');
    expect(history).toHaveLength(0);
  });
});
