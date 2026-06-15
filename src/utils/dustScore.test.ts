import { describe, expect, it } from 'vitest';

import type { CollectionItem } from '../types/collection';
import {
  calculateDustScore,
  getDustDays,
  getDustLevel,
  isExpired,
  sortByDustScore,
} from './dustScore';

const baseItem: CollectionItem = {
  id: 'test-item',
  title: 'Test item',
  url: 'https://example.com',
  type: 'article',
  status: 'pending',
  reason: 'reference',
  source: 'test',
  collectedAt: '2026-06-01T00:00:00.000Z',
  importance: 3,
  tags: [],
};

describe('dust score helpers', () => {
  it('returns elapsed days from the latest relevant touch date', () => {
    const days = getDustDays(
      { ...baseItem, lastOpenedAt: '2026-06-05T00:00:00.000Z' },
      new Date('2026-06-11T00:00:00.000Z'),
    );

    expect(days).toBe(6);
  });

  it('calculates a weighted dust score for active items', () => {
    const score = calculateDustScore(baseItem, new Date('2026-06-11T00:00:00.000Z'));

    expect(score).toBe(29);
  });

  it('returns 0 score for terminal items', () => {
    const score = calculateDustScore(
      { ...baseItem, status: 'archived' },
      new Date('2026-06-11T00:00:00.000Z'),
    );

    expect(score).toBe(0);
  });

  it('maps scores to dust levels', () => {
    expect(getDustLevel(baseItem, new Date('2026-06-11T00:00:00.000Z'))).toBe('light');
    expect(
      getDustLevel({ ...baseItem, status: 'abandoned' }, new Date('2026-07-27T00:00:00.000Z')),
    ).toBe('buried');
  });

  it('detects expired active items', () => {
    expect(
      isExpired(
        { ...baseItem, expiresAt: '2026-06-10T00:00:00.000Z' },
        new Date('2026-06-11T00:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('does not treat terminal items as expired', () => {
    expect(
      isExpired(
        { ...baseItem, status: 'processed', expiresAt: '2026-06-10T00:00:00.000Z' },
        new Date('2026-06-11T00:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('sorts by dust score without mutating the input', () => {
    const oldItem: CollectionItem = {
      ...baseItem,
      id: 'old',
      collectedAt: '2026-01-01T00:00:00.000Z',
    };
    const recentItem: CollectionItem = {
      ...baseItem,
      id: 'recent',
      collectedAt: '2026-06-10T00:00:00.000Z',
    };
    const input = [recentItem, oldItem];

    const sorted = sortByDustScore(input, new Date('2026-06-11T00:00:00.000Z'));

    expect(sorted.map((item) => item.id)).toEqual(['old', 'recent']);
    expect(input.map((item) => item.id)).toEqual(['recent', 'old']);
  });
});
