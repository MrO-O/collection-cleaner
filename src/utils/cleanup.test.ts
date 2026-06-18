import { describe, expect, it } from 'vitest';

import type { CollectionItem, CollectionStatus } from '../types/collection';
import { calculateDustScore } from './dustScore';
import { getTodayCleanupItems } from './cleanup';

const now = new Date('2026-06-18T12:00:00.000Z');

function item(id: string, overrides: Partial<CollectionItem> = {}): CollectionItem {
  return {
    id,
    title: `Item ${id}`,
    type: 'article',
    status: 'new',
    reason: 'reference',
    source: 'test',
    collectedAt: '2026-06-01T12:00:00.000Z',
    importance: 3,
    tags: [],
    ...overrides,
  };
}

describe('today cleanup recommendations', () => {
  it('returns no recommendations for an empty list', () => {
    expect(getTodayCleanupItems([], { now })).toEqual([]);
  });

  it('excludes terminal statuses', () => {
    const terminalStatuses: CollectionStatus[] = [
      'processed',
      'archived',
      'deleted',
      'abandoned',
      'converted',
    ];
    const items = terminalStatuses.map((status) => item(status, { status }));

    expect(getTodayCleanupItems(items, { now })).toEqual([]);
  });

  it('prioritizes pending items before other active statuses', () => {
    const oldNewItem = item('old-new', { collectedAt: '2025-01-01T00:00:00.000Z' });
    const pendingItem = item('pending', {
      status: 'pending',
      collectedAt: '2026-06-17T00:00:00.000Z',
    });

    expect(getTodayCleanupItems([oldNewItem, pendingItem], { now })[0].id).toBe('pending');
  });

  it('prioritizes expired items within the same status', () => {
    const active = item('active', { status: 'pending', collectedAt: '2026-01-01T00:00:00.000Z' });
    const expired = item('expired', {
      status: 'pending',
      collectedAt: '2026-06-17T00:00:00.000Z',
      expiresAt: '2026-06-17T12:00:00.000Z',
    });

    expect(getTodayCleanupItems([active, expired], { now })[0].id).toBe('expired');
  });

  it('prioritizes the higher dust score after status and expiry', () => {
    const lowerDust = item('lower-dust', { reason: 'reference' });
    const higherDust = item('higher-dust', { reason: 'fear_of_losing' });

    expect(calculateDustScore(higherDust, now)).toBeGreaterThan(calculateDustScore(lowerDust, now));
    expect(getTodayCleanupItems([lowerDust, higherDust], { now })[0].id).toBe('higher-dust');
  });

  it('returns at most three items by default', () => {
    const recommendations = getTodayCleanupItems(
      [item('a'), item('b'), item('c'), item('d'), item('e')],
      { now },
    );

    expect(recommendations).toHaveLength(3);
  });

  it('uses collected date and id to keep ordering deterministic', () => {
    const newer = item('newer', { collectedAt: '2026-06-10T00:00:00.000Z' });
    const sameDateB = item('b', { collectedAt: '2026-05-01T00:00:00.000Z' });
    const sameDateA = item('a', { collectedAt: '2026-05-01T00:00:00.000Z' });

    const first = getTodayCleanupItems([newer, sameDateB, sameDateA], { now }).map(({ id }) => id);
    const second = getTodayCleanupItems([sameDateA, newer, sameDateB], { now }).map(({ id }) => id);

    expect(first).toEqual(['a', 'b', 'newer']);
    expect(second).toEqual(first);
  });
});
