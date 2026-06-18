import type { CollectionItem } from '../types/collection';
import { calculateDustScore, getDustDays, isExpired } from './dustScore';

const cleanupStatuses = new Set<CollectionItem['status']>(['new', 'cooling', 'pending']);

export interface CleanupOptions {
  now?: Date;
  limit?: number;
}

export interface CleanupPriority {
  pending: number;
  expired: number;
  dustScore: number;
  dustDays: number;
  importance: number;
  collectedAt: number;
}

export function isCleanupCandidate(item: CollectionItem): boolean {
  return cleanupStatuses.has(item.status);
}

export function calculateCleanupPriority(item: CollectionItem, now = new Date()): CleanupPriority {
  return {
    pending: item.status === 'pending' ? 1 : 0,
    expired: isExpired(item, now) ? 1 : 0,
    dustScore: calculateDustScore(item, now),
    dustDays: getDustDays(item, now),
    importance: item.importance,
    collectedAt: new Date(item.collectedAt).getTime(),
  };
}

export function getTodayCleanupItems(
  items: CollectionItem[],
  { now = new Date(), limit = 3 }: CleanupOptions = {},
): CollectionItem[] {
  const safeLimit = Math.max(0, Math.floor(limit));

  return items
    .filter(isCleanupCandidate)
    .map((item) => ({ item, priority: calculateCleanupPriority(item, now) }))
    .sort((left, right) => {
      const priorityKeys: Array<keyof Omit<CleanupPriority, 'collectedAt'>> = [
        'pending',
        'expired',
        'dustScore',
        'dustDays',
        'importance',
      ];

      for (const key of priorityKeys) {
        const difference = right.priority[key] - left.priority[key];

        if (difference !== 0) {
          return difference;
        }
      }

      const collectedDifference = left.priority.collectedAt - right.priority.collectedAt;

      if (collectedDifference !== 0) {
        return collectedDifference;
      }

      return left.item.id.localeCompare(right.item.id);
    })
    .slice(0, safeLimit)
    .map(({ item }) => item);
}
