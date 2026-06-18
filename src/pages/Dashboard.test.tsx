import { fireEvent, render, screen } from '@testing-library/react';
import { useReducer } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { CollectionsContext, type CollectionsActions } from '../store/collectionsContext';
import { collectionsReducer, type MutatingCollectionsAction } from '../store/collectionsReducer';
import type { CollectionItem } from '../types/collection';
import { Dashboard } from './Dashboard';

const recommendation: CollectionItem = {
  id: 'cleanup-item',
  title: 'Review the saved cleanup guide',
  url: 'https://example.com/cleanup-guide',
  type: 'article',
  status: 'pending',
  reason: 'read_later',
  source: 'test',
  collectedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-06-01T00:00:00.000Z',
  importance: 4,
  tags: ['cleanup'],
};

function DashboardHarness({ initialItems }: { initialItems: CollectionItem[] }) {
  const [state, dispatch] = useReducer(collectionsReducer, {
    items: initialItems,
    history: [],
  });

  function dispatchItemAction(
    type: 'markProcessed' | 'archiveItem' | 'postponeItem' | 'abandonItem' | 'openItem',
    itemId: string,
  ) {
    dispatch({
      type,
      itemId,
      at: '2026-06-18T12:00:00.000Z',
      eventId: `${type}-${itemId}`,
      ...(type === 'postponeItem' ? { days: 7 } : {}),
    } as MutatingCollectionsAction);
  }

  const actions: CollectionsActions = {
    createCollection: async () => 'new-item',
    updateCollection: async () => true,
    clearAllCollections: async () => undefined,
    loadDemoCollections: async () => 0,
    replaceAllCollections: async () => undefined,
    openItem: (itemId) => dispatchItemAction('openItem', itemId),
    markProcessed: (itemId) => dispatchItemAction('markProcessed', itemId),
    archiveItem: (itemId) => dispatchItemAction('archiveItem', itemId),
    postponeItem: (itemId) => dispatchItemAction('postponeItem', itemId),
    deleteItem: () => undefined,
    abandonItem: (itemId) => dispatchItemAction('abandonItem', itemId),
    convertItem: () => undefined,
  };

  return (
    <CollectionsContext.Provider
      value={{
        items: state.items,
        history: state.history,
        loading: false,
        error: null,
        getItemById: (itemId) => state.items.find((item) => item.id === itemId),
        getHistoryForItem: (itemId) => state.history.filter((entry) => entry.itemId === itemId),
        actions,
      }}
    >
      <Dashboard />
    </CollectionsContext.Provider>
  );
}

function renderDashboard(items: CollectionItem[]) {
  return render(
    <MemoryRouter>
      <DashboardHarness initialItems={items} />
    </MemoryRouter>,
  );
}

describe('Dashboard today cleanup', () => {
  it('shows a recommendation card for an active item', () => {
    renderDashboard([recommendation]);

    expect(screen.getByText('Review the saved cleanup guide')).toBeTruthy();
    expect(screen.getByText('Expired', { exact: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mark processed' })).toBeTruthy();
  });

  it('removes a recommendation immediately after it is processed', () => {
    renderDashboard([recommendation]);

    fireEvent.click(screen.getByRole('button', { name: 'Mark processed' }));

    expect(screen.queryByText('Review the saved cleanup guide')).toBeNull();
    expect(screen.getByText('Nothing needs cleanup today')).toBeTruthy();
  });

  it('shows the no-cleanup state when all items are terminal', () => {
    renderDashboard([{ ...recommendation, status: 'archived' }]);

    expect(screen.getByText('Nothing needs cleanup today')).toBeTruthy();
  });
});
