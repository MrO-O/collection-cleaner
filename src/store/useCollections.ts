import { useContext } from 'react';

import { CollectionsContext } from './collectionsContext';

export function useCollections() {
  const context = useContext(CollectionsContext);

  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }

  return context;
}
