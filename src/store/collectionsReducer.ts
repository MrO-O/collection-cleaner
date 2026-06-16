import type {
  CollectionEventType,
  CollectionHistoryEntry,
  CollectionItem,
  CollectionStatus,
} from '../types/collection';

export interface CollectionsState {
  items: CollectionItem[];
  history: CollectionHistoryEntry[];
}

interface BaseCollectionAction {
  itemId: string;
  at: string;
  eventId: string;
  note?: string;
}

export type CollectionsAction =
  | { type: 'hydrate'; state: CollectionsState }
  | ({ type: 'createCollection'; item: CollectionItem } & BaseCollectionAction)
  | ({ type: 'updateCollection'; item: CollectionItem } & BaseCollectionAction)
  | ({ type: 'openItem' } & BaseCollectionAction)
  | ({ type: 'markProcessed' } & BaseCollectionAction)
  | ({ type: 'archiveItem' } & BaseCollectionAction)
  | ({ type: 'postponeItem'; days?: number } & BaseCollectionAction)
  | ({ type: 'deleteItem' } & BaseCollectionAction)
  | ({ type: 'abandonItem' } & BaseCollectionAction)
  | ({ type: 'convertItem' } & BaseCollectionAction)
  | ({ type: 'addNote'; note: string } & BaseCollectionAction);

export type MutatingCollectionsAction = Exclude<CollectionsAction, { type: 'hydrate' }>;

const actionEventType: Record<MutatingCollectionsAction['type'], CollectionEventType> = {
  createCollection: 'created',
  updateCollection: 'updated',
  openItem: 'opened',
  markProcessed: 'processed',
  archiveItem: 'archived',
  postponeItem: 'postponed',
  deleteItem: 'deleted',
  abandonItem: 'abandoned',
  convertItem: 'converted',
  addNote: 'note_added',
};

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function createHistoryEntry(action: MutatingCollectionsAction): CollectionHistoryEntry {
  return {
    id: action.eventId,
    itemId: action.itemId,
    type: actionEventType[action.type],
    createdAt: action.at,
    note: action.note,
  };
}

function nextStatusForAction(
  actionType: MutatingCollectionsAction['type'],
): CollectionStatus | undefined {
  if (actionType === 'markProcessed') {
    return 'processed';
  }

  if (actionType === 'archiveItem') {
    return 'archived';
  }

  if (actionType === 'deleteItem') {
    return 'deleted';
  }

  if (actionType === 'abandonItem') {
    return 'abandoned';
  }

  if (actionType === 'convertItem') {
    return 'converted';
  }

  return undefined;
}

function updateItem(item: CollectionItem, action: MutatingCollectionsAction): CollectionItem {
  if (action.type === 'openItem') {
    return { ...item, lastOpenedAt: action.at };
  }

  if (action.type === 'postponeItem') {
    const days = action.days ?? 7;
    return {
      ...item,
      expiresAt: addDays(action.at, days),
      status: item.status === 'new' ? 'cooling' : item.status,
    };
  }

  if (action.type === 'markProcessed') {
    return { ...item, status: 'processed', processedAt: action.at, lastReviewedAt: action.at };
  }

  if (action.type === 'addNote') {
    const separator = item.notes ? '\n' : '';
    return { ...item, notes: `${item.notes ?? ''}${separator}${action.note}` };
  }

  const status = nextStatusForAction(action.type);

  return status ? { ...item, status, lastReviewedAt: action.at } : item;
}

export function collectionsReducer(
  state: CollectionsState,
  action: CollectionsAction,
): CollectionsState {
  if (action.type === 'hydrate') {
    return action.state;
  }

  if (action.type === 'createCollection') {
    const itemExists = state.items.some((item) => item.id === action.itemId);

    if (itemExists) {
      return state;
    }

    return {
      items: [action.item, ...state.items],
      history: [...state.history, createHistoryEntry(action)],
    };
  }

  const itemExists = state.items.some((item) => item.id === action.itemId);

  if (!itemExists) {
    return state;
  }

  if (action.type === 'updateCollection') {
    return {
      items: state.items.map((item) => (item.id === action.itemId ? action.item : item)),
      history: [...state.history, createHistoryEntry(action)],
    };
  }

  return {
    items: state.items.map((item) => (item.id === action.itemId ? updateItem(item, action) : item)),
    history: [...state.history, createHistoryEntry(action)],
  };
}

export function getItemHistory(
  history: CollectionHistoryEntry[],
  itemId: string,
): CollectionHistoryEntry[] {
  return history
    .filter((entry) => entry.itemId === itemId)
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}
