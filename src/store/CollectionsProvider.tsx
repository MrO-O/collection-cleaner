import { useMemo, useReducer, type ReactNode } from 'react';

import { mockItems } from '../data/mockItems';
import {
  collectionsReducer,
  getItemHistory,
  type CollectionsAction,
  type CollectionsState,
} from './collectionsReducer';
import {
  CollectionsContext,
  type CollectionsActions,
  type CollectionsContextValue,
} from './collectionsContext';

const initialState: CollectionsState = {
  items: mockItems,
  history: [],
};

function createAction(
  type: CollectionsAction['type'],
  itemId: string,
  note: string,
  extra?: Partial<CollectionsAction>,
): CollectionsAction {
  const at = new Date().toISOString();
  return {
    type,
    itemId,
    at,
    eventId: `${type}-${itemId}-${Date.now()}`,
    note,
    ...extra,
  } as CollectionsAction;
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collectionsReducer, initialState);

  const value = useMemo<CollectionsContextValue>(() => {
    const actions: CollectionsActions = {
      openItem: (itemId) => dispatch(createAction('openItem', itemId, 'Opened link')),
      markProcessed: (itemId) =>
        dispatch(createAction('markProcessed', itemId, 'Marked as processed')),
      archiveItem: (itemId) => dispatch(createAction('archiveItem', itemId, 'Archived item')),
      postponeItem: (itemId, days = 7) =>
        dispatch(createAction('postponeItem', itemId, `Postponed for ${days} days`, { days })),
      deleteItem: (itemId) => dispatch(createAction('deleteItem', itemId, 'Deleted item')),
      abandonItem: (itemId) => dispatch(createAction('abandonItem', itemId, 'Abandoned item')),
      convertItem: (itemId) =>
        dispatch(createAction('convertItem', itemId, 'Converted to note or reference')),
    };

    return {
      items: state.items,
      history: state.history,
      getItemById: (itemId) => state.items.find((item) => item.id === itemId),
      getHistoryForItem: (itemId) => getItemHistory(state.history, itemId),
      actions,
    };
  }, [state.history, state.items]);

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}
