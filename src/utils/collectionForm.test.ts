import { describe, expect, it } from 'vitest';

import type { CollectionItem } from '../types/collection';
import {
  createCollectionFromInput,
  defaultCollectionFormValues,
  formValuesToInput,
  parseTagsInput,
  updateCollectionFromInput,
  validateCollectionForm,
} from './collectionForm';

describe('collection form helpers', () => {
  it('requires a title', () => {
    const errors = validateCollectionForm({ ...defaultCollectionFormValues, title: '   ' });

    expect(errors.title).toBe('Title is required.');
  });

  it('rejects invalid URLs', () => {
    const errors = validateCollectionForm({
      ...defaultCollectionFormValues,
      title: 'Valid title',
      url: 'not a url',
    });

    expect(errors.url).toBe('URL must be valid.');
  });

  it('parses comma-separated tags', () => {
    expect(parseTagsInput('learning, video, , later')).toEqual(['learning', 'video', 'later']);
  });

  it('creates a collection with id, created date, default status, and default priority', () => {
    const item = createCollectionFromInput(
      formValuesToInput({
        ...defaultCollectionFormValues,
        title: 'New item',
      }),
      { id: 'item-new', createdAt: '2026-06-16T01:00:00.000Z' },
    );

    expect(item).toMatchObject({
      id: 'item-new',
      collectedAt: '2026-06-16T01:00:00.000Z',
      status: 'new',
      importance: 3,
    });
  });

  it('updates editable fields while preserving id and created date', () => {
    const existing: CollectionItem = {
      id: 'item-1',
      title: 'Old title',
      type: 'article',
      status: 'pending',
      reason: 'read_later',
      source: 'old source',
      collectedAt: '2026-06-01T00:00:00.000Z',
      processedAt: '2026-06-10T00:00:00.000Z',
      importance: 2,
      tags: ['old'],
    };

    const updated = updateCollectionFromInput(
      existing,
      formValuesToInput({
        ...defaultCollectionFormValues,
        title: 'New title',
        source: 'new source',
        tags: 'new, tag',
      }),
    );

    expect(updated.id).toBe(existing.id);
    expect(updated.collectedAt).toBe(existing.collectedAt);
    expect(updated.processedAt).toBe(existing.processedAt);
    expect(updated.title).toBe('New title');
    expect(updated.tags).toEqual(['new', 'tag']);
  });
});
