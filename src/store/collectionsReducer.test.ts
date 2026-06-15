import { describe, expect, it } from 'vitest';

import type { CollectionItem } from '../types/collection';
import { collectionsReducer, type CollectionsState } from './collectionsReducer';

const baseItem: CollectionItem = {
  id: 'item-1',
  title: 'Test item',
  url: 'https://example.com',
  type: 'article',
  status: 'pending',
  reason: 'read_later',
  source: 'test',
  collectedAt: '2026-06-01T00:00:00.000Z',
  importance: 3,
  tags: [],
};

const baseState: CollectionsState = {
  items: [baseItem],
  history: [],
};

describe('collectionsReducer', () => {
  it('marks an item as processed and sets processedAt', () => {
    const state = collectionsReducer(baseState, {
      type: 'markProcessed',
      itemId: 'item-1',
      at: '2026-06-15T10:00:00.000Z',
      eventId: 'event-1',
    });

    expect(state.items[0].status).toBe('processed');
    expect(state.items[0].processedAt).toBe('2026-06-15T10:00:00.000Z');
    expect(state.history[0].type).toBe('processed');
  });

  it('postpones an item by updating expiresAt', () => {
    const state = collectionsReducer(baseState, {
      type: 'postponeItem',
      itemId: 'item-1',
      at: '2026-06-15T10:00:00.000Z',
      eventId: 'event-2',
      days: 7,
    });

    expect(state.items[0].expiresAt).toBe('2026-06-22T10:00:00.000Z');
    expect(state.history[0].type).toBe('postponed');
  });

  it('opens an item by updating lastOpenedAt and appending an opened event', () => {
    const state = collectionsReducer(baseState, {
      type: 'openItem',
      itemId: 'item-1',
      at: '2026-06-15T10:00:00.000Z',
      eventId: 'event-3',
    });

    expect(state.items[0].lastOpenedAt).toBe('2026-06-15T10:00:00.000Z');
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({
      id: 'event-3',
      itemId: 'item-1',
      type: 'opened',
    });
  });

  it('deletes an item by setting status to deleted', () => {
    const state = collectionsReducer(baseState, {
      type: 'deleteItem',
      itemId: 'item-1',
      at: '2026-06-15T10:00:00.000Z',
      eventId: 'event-4',
    });

    expect(state.items[0].status).toBe('deleted');
    expect(state.history[0].type).toBe('deleted');
  });

  it('returns the same state for a missing item', () => {
    const state = collectionsReducer(baseState, {
      type: 'deleteItem',
      itemId: 'missing',
      at: '2026-06-15T10:00:00.000Z',
      eventId: 'event-5',
    });

    expect(state).toBe(baseState);
    expect(state.history).toHaveLength(0);
  });
});
