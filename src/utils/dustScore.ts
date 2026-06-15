import type { CollectionItem } from '../types/collection';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function calculateDustScore(item: CollectionItem, now = new Date()): number {
  const lastRelevantDate = item.lastOpenedAt ?? item.addedAt;
  const ageInDays = Math.max(
    0,
    Math.floor((now.getTime() - new Date(lastRelevantDate).getTime()) / DAY_IN_MS),
  );

  if (item.status === 'archived' || item.status === 'deleted') {
    return 0;
  }

  return Math.min(100, ageInDays);
}
