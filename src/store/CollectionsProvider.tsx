import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

import { mockItems } from '../data/mockItems';
import { collectionsRepository } from '../db/collectionsRepository';
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
        await collectionsRepository.seedCollectionsIfEmpty(mockItems);

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

  async function runAction(action: MutatingCollectionsAction) {
    const currentState = stateRef.current;
    const nextState = collectionsReducer(currentState, action);

    if (nextState === currentState) {
      return;
    }

    stateRef.current = nextState;
    dispatch(action);
    setError(null);

    try {
      await collectionsRepository.persistCollectionAction(currentState, action);
    } catch (persistError) {
      setError(errorMessage(persistError));
    }
  }

  const value = useMemo<CollectionsContextValue>(() => {
    const actions: CollectionsActions = {
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
