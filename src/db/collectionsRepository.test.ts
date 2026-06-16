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
  it('returns an empty list for a new database without automatic seed', async () => {
    const items = await repository.getAllCollections();
    const history = await repository.getAllCollectionHistory();

    expect(items).toEqual([]);
    expect(history).toEqual([]);
  });

  it('loads demo data only when explicitly requested', async () => {
    const seededCount = await repository.seedDemoCollections([baseItem]);
    const items = await repository.getAllCollections();

    expect(seededCount).toBe(1);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-1');
  });

  it('replaces existing data when loading demo data', async () => {
    await repository.saveCollection({ ...baseItem, id: 'item-existing', title: 'Real item' });
    await repository.appendCollectionHistory({
      ...openedEvent,
      id: 'event-existing',
      itemId: 'item-existing',
    });

    await repository.seedDemoCollections([{ ...baseItem, id: 'item-demo', title: 'Demo item' }]);
    const items = await repository.getAllCollections();
    const history = await repository.getAllCollectionHistory();

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-demo');
    expect(history).toHaveLength(0);
  });

  it('clears all collections and history', async () => {
    await repository.saveCollection(baseItem);
    await repository.appendCollectionHistory(openedEvent);

    await repository.clearAllCollections();
    const items = await repository.getAllCollections();
    const history = await repository.getAllCollectionHistory();

    expect(items).toEqual([]);
    expect(history).toEqual([]);
  });

  it('does not restore demo data after clearing local data', async () => {
    await repository.seedDemoCollections([baseItem]);
    await repository.clearAllCollections();

    const items = await repository.getAllCollections();

    expect(items).toEqual([]);
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

  it('persists created items and created history entries', async () => {
    const newItem: CollectionItem = { ...baseItem, id: 'item-created', title: 'Created item' };

    await repository.persistCollectionAction(
      { items: [], history: [] },
      {
        type: 'createCollection',
        itemId: 'item-created',
        item: newItem,
        at: '2026-06-15T10:00:00.000Z',
        eventId: 'event-created',
      },
    );
    const item = await repository.getCollectionById('item-created');
    const history = await repository.getCollectionHistory('item-created');

    expect(item?.title).toBe('Created item');
    expect(history[0].type).toBe('created');
  });

  it('persists edited items and updated history entries', async () => {
    await repository.saveCollection(baseItem);
    const updatedItem: CollectionItem = { ...baseItem, title: 'Edited item' };

    await repository.persistCollectionAction(
      { items: [baseItem], history: [] },
      {
        type: 'updateCollection',
        itemId: 'item-1',
        item: updatedItem,
        at: '2026-06-15T10:00:00.000Z',
        eventId: 'event-updated',
      },
    );
    const item = await repository.getCollectionById('item-1');
    const history = await repository.getCollectionHistory('item-1');

    expect(item?.id).toBe('item-1');
    expect(item?.collectedAt).toBe(baseItem.collectedAt);
    expect(item?.title).toBe('Edited item');
    expect(history[0].type).toBe('updated');
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
