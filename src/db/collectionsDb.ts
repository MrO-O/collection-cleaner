import Dexie, { type Table } from 'dexie';

import type { CollectionHistoryEntry, CollectionItem } from '../types/collection';

export const databaseName = 'collection-cleaner';

export class CollectionsDb extends Dexie {
  collections!: Table<CollectionItem, string>;
  history!: Table<CollectionHistoryEntry, string>;

  constructor(name = databaseName) {
    super(name);

    this.version(1).stores({
      collections: 'id,status,type,reason,collectedAt,expiresAt,importance',
      history: 'id,itemId,type,createdAt',
    });
  }
}

export function createCollectionsDb(name = databaseName) {
  return new CollectionsDb(name);
}

export const collectionsDb = createCollectionsDb();
