import { createContext } from 'react';

import type { CollectionHistoryEntry, CollectionItem } from '../types/collection';

export interface CollectionsActions {
  openItem: (itemId: string) => void;
  markProcessed: (itemId: string) => void;
  archiveItem: (itemId: string) => void;
  postponeItem: (itemId: string, days?: number) => void;
  deleteItem: (itemId: string) => void;
  abandonItem: (itemId: string) => void;
  convertItem: (itemId: string) => void;
}

export interface CollectionsContextValue {
  items: CollectionItem[];
  history: CollectionHistoryEntry[];
  loading: boolean;
  error: string | null;
  getItemById: (itemId: string) => CollectionItem | undefined;
  getHistoryForItem: (itemId: string) => CollectionHistoryEntry[];
  actions: CollectionsActions;
}

export const CollectionsContext = createContext<CollectionsContextValue | undefined>(undefined);
