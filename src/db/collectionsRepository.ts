import type { CollectionHistoryEntry, CollectionItem, CollectionStatus } from '../types/collection';
import {
  collectionsReducer,
  type CollectionsState,
  type MutatingCollectionsAction,
} from '../store/collectionsReducer';
import { collectionsDb, type CollectionsDb } from './collectionsDb';

export interface CollectionsRepository {
  getAllCollections: () => Promise<CollectionItem[]>;
  getCollectionById: (id: string) => Promise<CollectionItem | undefined>;
  saveCollection: (item: CollectionItem) => Promise<string>;
  updateCollection: (item: CollectionItem) => Promise<string>;
  updateCollectionStatus: (
    id: string,
    status: CollectionStatus,
    changes?: Partial<CollectionItem>,
  ) => Promise<number>;
  appendCollectionHistory: (entry: CollectionHistoryEntry) => Promise<string>;
  getAllCollectionHistory: () => Promise<CollectionHistoryEntry[]>;
  getCollectionHistory: (itemId: string) => Promise<CollectionHistoryEntry[]>;
  seedDemoCollections: (demoData: CollectionItem[]) => Promise<number>;
  clearAllCollections: () => Promise<void>;
  persistCollectionAction: (
    state: CollectionsState,
    action: MutatingCollectionsAction,
  ) => Promise<CollectionsState>;
}

export function createCollectionsRepository(
  db: CollectionsDb = collectionsDb,
): CollectionsRepository {
  async function updateCollection(item: CollectionItem) {
    await db.collections.put(item);
    return item.id;
  }

  async function appendCollectionHistory(entry: CollectionHistoryEntry) {
    await db.history.put(entry);
    return entry.id;
  }

  return {
    getAllCollections: () => db.collections.toArray(),
    getCollectionById: (id) => db.collections.get(id),
    saveCollection: updateCollection,
    updateCollection,
    updateCollectionStatus: (id, status, changes = {}) =>
      db.collections.update(id, { ...changes, status }),
    appendCollectionHistory,
    getAllCollectionHistory: () => db.history.toArray(),
    getCollectionHistory: async (itemId) => {
      const history = await db.history.where('itemId').equals(itemId).toArray();
      return history.sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
    },
    seedDemoCollections: async (demoData) => {
      await db.transaction('rw', db.collections, db.history, async () => {
        await db.history.clear();
        await db.collections.clear();
        await db.collections.bulkPut(demoData);
      });
      return demoData.length;
    },
    clearAllCollections: async () => {
      await db.transaction('rw', db.collections, db.history, async () => {
        await db.history.clear();
        await db.collections.clear();
      });
    },
    persistCollectionAction: async (state, action) => {
      const nextState = collectionsReducer(state, action);

      if (nextState === state) {
        return state;
      }

      const updatedItem =
        action.type === 'createCollection' || action.type === 'updateCollection'
          ? action.item
          : nextState.items.find((item) => item.id === action.itemId);
      const newHistoryEntry = nextState.history.find((entry) => entry.id === action.eventId);

      if (updatedItem) {
        await updateCollection(updatedItem);
      }

      if (newHistoryEntry) {
        await appendCollectionHistory(newHistoryEntry);
      }

      return nextState;
    },
  };
}

export const collectionsRepository = createCollectionsRepository();
