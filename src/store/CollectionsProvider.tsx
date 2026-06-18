import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

import { mockItems } from '../data/mockItems';
import { collectionsRepository } from '../db/collectionsRepository';
import { createCollectionFromInput, updateCollectionFromInput } from '../utils/collectionForm';
import {
  collectionsReducer,
  getItemHistory,
  type CollectionsState,
  type MutatingCollectionsAction,
} from './collectionsReducer';
import {
  CollectionsContext,
  type CollectionsActions,
  type CollectionsContextValue,
} from './collectionsContext';

const emptyState: CollectionsState = {
  items: [],
  history: [],
};

function createAction(
  type: MutatingCollectionsAction['type'],
  itemId: string,
  note: string,
  extra?: Partial<MutatingCollectionsAction>,
): MutatingCollectionsAction {
  const at = new Date().toISOString();
  return {
    type,
    itemId,
    at,
    eventId: `${type}-${itemId}-${Date.now()}`,
    note,
    ...extra,
  } as MutatingCollectionsAction;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown collection storage error';
}

function createCollectionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collectionsReducer, emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    let cancelled = false;

    async function loadCollections() {
      setLoading(true);
      setError(null);

      try {
        const [items, history] = await Promise.all([
          collectionsRepository.getAllCollections(),
          collectionsRepository.getAllCollectionHistory(),
        ]);
        const loadedState: CollectionsState = { items, history };

        if (!cancelled) {
          stateRef.current = loadedState;
          dispatch({ type: 'hydrate', state: loadedState });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(errorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(action: MutatingCollectionsAction): Promise<boolean> {
    const currentState = stateRef.current;
    const nextState = collectionsReducer(currentState, action);

    if (nextState === currentState) {
      return false;
    }

    stateRef.current = nextState;
    dispatch(action);
    setError(null);

    try {
      await collectionsRepository.persistCollectionAction(currentState, action);
    } catch (persistError) {
      setError(errorMessage(persistError));
      return false;
    }

    return true;
  }

  const value = useMemo<CollectionsContextValue>(() => {
    const actions: CollectionsActions = {
      clearAllCollections: async () => {
        setError(null);

        try {
          await collectionsRepository.clearAllCollections();
          stateRef.current = emptyState;
          dispatch({ type: 'hydrate', state: emptyState });
        } catch (clearError) {
          setError(errorMessage(clearError));
          throw clearError;
        }
      },
      loadDemoCollections: async () => {
        setError(null);

        try {
          const seededCount = await collectionsRepository.seedDemoCollections(mockItems);
          const demoState: CollectionsState = {
            items: await collectionsRepository.getAllCollections(),
            history: [],
          };

          stateRef.current = demoState;
          dispatch({ type: 'hydrate', state: demoState });

          return seededCount;
        } catch (seedError) {
          setError(errorMessage(seedError));
          throw seedError;
        }
      },
      replaceAllCollections: async (items, history) => {
        setError(null);

        try {
          await collectionsRepository.replaceAllCollections(items, history);
          const restoredState: CollectionsState = { items, history };
          stateRef.current = restoredState;
          dispatch({ type: 'hydrate', state: restoredState });
        } catch (restoreError) {
          setError(errorMessage(restoreError));
          throw restoreError;
        }
      },
      createCollection: async (input) => {
        const itemId = createCollectionId();
        const item = createCollectionFromInput(input, {
          id: itemId,
          createdAt: new Date().toISOString(),
        });

        const saved = await runAction({
          type: 'createCollection',
          itemId,
          item,
          at: item.collectedAt,
          eventId: `createCollection-${itemId}-${Date.now()}`,
          note: 'Created collection item',
        });

        if (!saved) {
          throw new Error('Failed to create collection item.');
        }

        return itemId;
      },
      updateCollection: async (itemId, input) => {
        const existing = stateRef.current.items.find((item) => item.id === itemId);

        if (!existing) {
          return false;
        }

        const updatedItem = updateCollectionFromInput(existing, input);

        return runAction({
          type: 'updateCollection',
          itemId,
          item: updatedItem,
          at: new Date().toISOString(),
          eventId: `updateCollection-${itemId}-${Date.now()}`,
          note: 'Updated collection item',
        });
      },
      openItem: (itemId) => {
        void runAction(createAction('openItem', itemId, 'Opened link'));
      },
      markProcessed: (itemId) => {
        void runAction(createAction('markProcessed', itemId, 'Marked as processed'));
      },
      archiveItem: (itemId) => {
        void runAction(createAction('archiveItem', itemId, 'Archived item'));
      },
      postponeItem: (itemId, days = 7) => {
        void runAction(
          createAction('postponeItem', itemId, `Postponed for ${days} days`, { days }),
        );
      },
      deleteItem: (itemId) => {
        void runAction(createAction('deleteItem', itemId, 'Deleted item'));
      },
      abandonItem: (itemId) => {
        void runAction(createAction('abandonItem', itemId, 'Abandoned item'));
      },
      convertItem: (itemId) => {
        void runAction(createAction('convertItem', itemId, 'Converted to note or reference'));
      },
    };

    return {
      items: state.items,
      history: state.history,
      loading,
      error,
      getItemById: (itemId) => state.items.find((item) => item.id === itemId),
      getHistoryForItem: (itemId) => getItemHistory(state.history, itemId),
      actions,
    };
  }, [error, loading, state.history, state.items]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}
