import Dexie from 'dexie';

export const databaseName = 'collection-cleaner';

export function createDatabase() {
  return new Dexie(databaseName);
}

export const db = createDatabase();
