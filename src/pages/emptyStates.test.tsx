import { render, screen } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { CollectionsContext, type CollectionsContextValue } from '../store/collectionsContext';
import { CollectionList } from './CollectionList';
import { Dashboard } from './Dashboard';

const emptyCollectionsValue: CollectionsContextValue = {
  items: [],
  history: [],
  loading: false,
  error: null,
  getItemById: () => undefined,
  getHistoryForItem: () => [],
  actions: {
    createCollection: async () => 'item-new',
    updateCollection: async () => true,
    clearAllCollections: async () => undefined,
    loadDemoCollections: async () => 0,
    replaceAllCollections: async () => undefined,
    openItem: () => undefined,
    markProcessed: () => undefined,
    archiveItem: () => undefined,
    postponeItem: () => undefined,
    deleteItem: () => undefined,
    abandonItem: () => undefined,
    convertItem: () => undefined,
  },
};

function renderWithCollections(element: React.ReactElement) {
  return render(
    <CollectionsContext.Provider value={emptyCollectionsValue}>
      <MemoryRouter>{element}</MemoryRouter>
    </CollectionsContext.Provider>,
  );
}

describe('empty states', () => {
  it('renders the collection list empty state', () => {
    renderWithCollections(<CollectionList />);

    expect(screen.getByText('No collections yet')).toBeTruthy();
    expect(screen.getByText('Add first collection')).toBeTruthy();
  });

  it('renders the dashboard empty state', () => {
    renderWithCollections(<Dashboard />);

    expect(screen.getByText('No collections yet')).toBeTruthy();
    expect(screen.getByText('Add first collection')).toBeTruthy();
  });
});
