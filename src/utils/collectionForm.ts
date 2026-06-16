import type { CollectionItem, CollectionItemInput } from '../types/collection';

export interface CollectionFormValues {
  title: string;
  url: string;
  source: string;
  type: CollectionItemInput['type'];
  reason: CollectionItemInput['reason'];
  importance: string;
  tags: string;
  notes: string;
  expiresAt: string;
}

export interface CollectionFormErrors {
  title?: string;
  url?: string;
  importance?: string;
}

export const defaultCollectionFormValues: CollectionFormValues = {
  title: '',
  url: '',
  source: '',
  type: 'article',
  reason: 'read_later',
  importance: '3',
  tags: '',
  notes: '',
  expiresAt: '',
};

export function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function formatTagsInput(tags: string[]): string {
  return tags.join(', ');
}

function normalizeOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateCollectionForm(values: CollectionFormValues): CollectionFormErrors {
  const errors: CollectionFormErrors = {};
  const title = values.title.trim();
  const url = values.url.trim();
  const importance = Number(values.importance);

  if (!title) {
    errors.title = 'Title is required.';
  }

  if (url) {
    try {
      new URL(url);
    } catch {
      errors.url = 'URL must be valid.';
    }
  }

  if (!Number.isInteger(importance) || importance < 1 || importance > 5) {
    errors.importance = 'Priority must be between 1 and 5.';
  }

  return errors;
}

export function hasCollectionFormErrors(errors: CollectionFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formValuesToInput(values: CollectionFormValues): CollectionItemInput {
  return {
    title: values.title.trim(),
    url: normalizeOptional(values.url),
    source: normalizeOptional(values.source),
    type: values.type,
    reason: values.reason,
    importance: Number(values.importance) as CollectionItemInput['importance'],
    tags: parseTagsInput(values.tags),
    notes: normalizeOptional(values.notes),
    expiresAt: values.expiresAt
      ? new Date(`${values.expiresAt}T00:00:00.000Z`).toISOString()
      : undefined,
  };
}

export function collectionToFormValues(item: CollectionItem): CollectionFormValues {
  return {
    title: item.title,
    url: item.url ?? '',
    source: item.source,
    type: item.type,
    reason: item.reason,
    importance: String(item.importance),
    tags: formatTagsInput(item.tags),
    notes: item.notes ?? '',
    expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
  };
}

export function createCollectionFromInput(
  input: CollectionItemInput,
  options: { id: string; createdAt: string },
): CollectionItem {
  return {
    id: options.id,
    title: input.title,
    url: input.url,
    source: input.source ?? 'manual',
    type: input.type,
    status: 'new',
    reason: input.reason,
    collectedAt: options.createdAt,
    expiresAt: input.expiresAt,
    importance: input.importance ?? 3,
    tags: input.tags,
    notes: input.notes,
  };
}

export function updateCollectionFromInput(
  existing: CollectionItem,
  input: CollectionItemInput,
): CollectionItem {
  return {
    ...existing,
    title: input.title,
    url: input.url,
    source: input.source ?? 'manual',
    type: input.type,
    reason: input.reason,
    expiresAt: input.expiresAt,
    importance: input.importance,
    tags: input.tags,
    notes: input.notes,
  };
}
