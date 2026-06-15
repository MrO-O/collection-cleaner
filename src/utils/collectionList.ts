import type {
  CollectionItem,
  CollectionReason,
  CollectionStatus,
  ContentType,
  DustLevel,
} from '../types/collection';
import { calculateDustScore, getDustDays, getDustLevel } from './dustScore';

export type CollectionFilterValue<T extends string> = 'all' | T;

export interface CollectionListFilters {
  query: string;
  status: CollectionFilterValue<CollectionStatus>;
  type: CollectionFilterValue<ContentType>;
  reason: CollectionFilterValue<CollectionReason>;
  dustLevel: CollectionFilterValue<DustLevel>;
}

export type CollectionSortOption =
  | 'dust_days_desc'
  | 'dust_score_desc'
  | 'collected_desc'
  | 'importance_desc';

export const defaultCollectionListFilters: CollectionListFilters = {
  query: '',
  status: 'all',
  type: 'all',
  reason: 'all',
  dustLevel: 'all',
};

function includesQuery(value: string | undefined, query: string): boolean {
  return value?.toLowerCase().includes(query) ?? false;
}

export function filterCollectionItems(
  items: CollectionItem[],
  filters: CollectionListFilters,
  now = new Date(),
): CollectionItem[] {
  const query = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery =
      query.length === 0 ||
      includesQuery(item.title, query) ||
      includesQuery(item.url, query) ||
      item.tags.some((tag) => includesQuery(tag, query));

    return (
      matchesQuery &&
      (filters.status === 'all' || item.status === filters.status) &&
      (filters.type === 'all' || item.type === filters.type) &&
      (filters.reason === 'all' || item.reason === filters.reason) &&
      (filters.dustLevel === 'all' || getDustLevel(item, now) === filters.dustLevel)
    );
  });
}

export function sortCollectionItems(
  items: CollectionItem[],
  sortBy: CollectionSortOption,
  now = new Date(),
): CollectionItem[] {
  return [...items].sort((left, right) => {
    if (sortBy === 'dust_days_desc') {
      return getDustDays(right, now) - getDustDays(left, now);
    }

    if (sortBy === 'dust_score_desc') {
      return calculateDustScore(right, now) - calculateDustScore(left, now);
    }

    if (sortBy === 'collected_desc') {
      return new Date(right.collectedAt).getTime() - new Date(left.collectedAt).getTime();
    }

    return right.importance - left.importance;
  });
}

export function getCollectionListItems(
  items: CollectionItem[],
  filters: CollectionListFilters,
  sortBy: CollectionSortOption,
  now = new Date(),
): CollectionItem[] {
  return sortCollectionItems(filterCollectionItems(items, filters, now), sortBy, now);
}
