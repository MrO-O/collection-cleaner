import { describe, expect, it } from 'vitest';

import type { CollectionItem } from '../types/collection';
import {
  defaultCollectionListFilters,
  filterCollectionItems,
  getCollectionListItems,
  sortCollectionItems,
} from './collectionList';

const now = new Date('2026-06-15T00:00:00.000Z');

const items: CollectionItem[] = [
  {
    id: 'article-old',
    title: 'Bookmark cleanup plan',
    url: 'https://example.com/bookmark-cleanup',
    type: 'article',
    status: 'pending',
    reason: 'read_later',
    source: 'newsletter',
    collectedAt: '2026-01-01T00:00:00.000Z',
    importance: 2,
    tags: ['bookmarks', 'cleanup'],
  },
  {
    id: 'repo-recent',
    title: 'IndexedDB helper repo',
    url: 'https://github.com/example/indexeddb-helper',
    type: 'repo',
    status: 'new',
    reason: 'reference',
    source: 'GitHub stars',
    collectedAt: '2026-06-10T00:00:00.000Z',
    importance: 5,
    tags: ['indexeddb'],
  },
  {
    id: 'video',
    title: 'Review queue walkthrough',
    url: 'https://example.com/review-video',
    type: 'video',
    status: 'abandoned',
    reason: 'learn_later',
    source: 'video playlist',
    collectedAt: '2026-04-01T00:00:00.000Z',
    importance: 3,
    tags: ['review'],
  },
];

describe('collection list helpers', () => {
  it('searches by title, url, and tags', () => {
    expect(
      filterCollectionItems(items, { ...defaultCollectionListFilters, query: 'cleanup' }, now).map(
        (item) => item.id,
      ),
    ).toEqual(['article-old']);
    expect(
      filterCollectionItems(
        items,
        { ...defaultCollectionListFilters, query: 'github.com' },
        now,
      ).map((item) => item.id),
    ).toEqual(['repo-recent']);
    expect(
      filterCollectionItems(items, { ...defaultCollectionListFilters, query: 'review' }, now).map(
        (item) => item.id,
      ),
    ).toEqual(['video']);
  });

  it('filters by status, type, reason, and dust level', () => {
    expect(
      filterCollectionItems(
        items,
        {
          ...defaultCollectionListFilters,
          status: 'abandoned',
          type: 'video',
          reason: 'learn_later',
          dustLevel: 'buried',
        },
        now,
      ).map((item) => item.id),
    ).toEqual(['video']);
  });

  it('sorts by dust days, recent collection, and priority', () => {
    expect(sortCollectionItems(items, 'dust_days_desc', now)[0].id).toBe('article-old');
    expect(sortCollectionItems(items, 'collected_desc', now)[0].id).toBe('repo-recent');
    expect(sortCollectionItems(items, 'importance_desc', now)[0].id).toBe('repo-recent');
  });

  it('combines filtering and sorting without mutating input', () => {
    const result = getCollectionListItems(
      items,
      { ...defaultCollectionListFilters, query: 'e' },
      'dust_score_desc',
      now,
    );

    expect(result.map((item) => item.id)).toEqual(['article-old', 'video', 'repo-recent']);
    expect(items.map((item) => item.id)).toEqual(['article-old', 'repo-recent', 'video']);
  });
});
