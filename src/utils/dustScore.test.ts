import { describe, expect, it } from 'vitest';

import type { CollectionItem } from '../types/collection';
import { calculateDustScore } from './dustScore';

const baseItem: CollectionItem = {
  id: 'test-item',
  title: 'Test item',
  url: 'https://example.com',
  type: 'article',
  status: 'unread',
  reason: 'reference',
  source: 'test',
  addedAt: '2026-06-01T00:00:00.000Z',
  tags: [],
};

describe('calculateDustScore', () => {
  it('returns elapsed days from addedAt as a placeholder score', () => {
    const score = calculateDustScore(baseItem, new Date('2026-06-11T00:00:00.000Z'));

    expect(score).toBe(10);
  });

  it('returns 0 for archived items', () => {
    const score = calculateDustScore(
      { ...baseItem, status: 'archived' },
      new Date('2026-06-11T00:00:00.000Z'),
    );

    expect(score).toBe(0);
  });
});
