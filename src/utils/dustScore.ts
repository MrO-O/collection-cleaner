import type { CollectionItem, DustLevel } from '../types/collection';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const terminalStatuses = new Set(['processed', 'archived', 'deleted', 'converted']);

function getLastTouchedAt(item: CollectionItem): string {
  return item.lastReviewedAt ?? item.lastOpenedAt ?? item.collectedAt;
}

export function getDustDays(item: CollectionItem, now = new Date()): number {
  return Math.max(
    0,
    Math.floor((now.getTime() - new Date(getLastTouchedAt(item)).getTime()) / DAY_IN_MS),
  );
}

export function calculateDustScore(item: CollectionItem, now = new Date()): number {
  if (terminalStatuses.has(item.status)) {
    return 0;
  }

  const dustDays = getDustDays(item, now);
  const statusWeight: Record<CollectionItem['status'], number> = {
    new: 0,
    cooling: -15,
    pending: 15,
    processed: 0,
    archived: 0,
    deleted: 0,
    abandoned: 30,
    converted: 0,
  };
  const reasonWeight: Record<CollectionItem['reason'], number> = {
    read_later: 8,
    learn_later: 10,
    buy_later: 4,
    reference: 0,
    inspiration: 0,
    fear_of_losing: 14,
    interesting: 6,
    unknown: 12,
  };
  const importanceWeight = item.importance * 2;
  const expiredWeight = isExpired(item, now) ? 20 : 0;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        dustDays * 0.8 +
          statusWeight[item.status] +
          reasonWeight[item.reason] +
          importanceWeight +
          expiredWeight,
      ),
    ),
  );
}

export function getDustLevel(item: CollectionItem, now = new Date()): DustLevel {
  const score = calculateDustScore(item, now);

  if (score >= 80) {
    return 'buried';
  }

  if (score >= 60) {
    return 'stale';
  }

  if (score >= 35) {
    return 'dusty';
  }

  if (score >= 15) {
    return 'light';
  }

  return 'fresh';
}

export function isExpired(item: CollectionItem, now = new Date()): boolean {
  if (!item.expiresAt || terminalStatuses.has(item.status)) {
    return false;
  }

  return new Date(item.expiresAt).getTime() < now.getTime();
}

export function sortByDustScore(items: CollectionItem[], now = new Date()): CollectionItem[] {
  return [...items].sort((left, right) => {
    const scoreDelta = calculateDustScore(right, now) - calculateDustScore(left, now);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return getDustDays(right, now) - getDustDays(left, now);
  });
}
