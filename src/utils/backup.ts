import type {
  CollectionEventType,
  CollectionHistoryEntry,
  CollectionItem,
  CollectionReason,
  CollectionStatus,
  ContentType,
} from '../types/collection';

export const BACKUP_APP = 'collection-cleaner' as const;
export const BACKUP_SCHEMA_VERSION = 1 as const;

const collectionStatuses: CollectionStatus[] = [
  'new',
  'cooling',
  'pending',
  'processed',
  'archived',
  'deleted',
  'abandoned',
  'converted',
];

const contentTypes: ContentType[] = [
  'article',
  'video',
  'product',
  'course',
  'paper',
  'repo',
  'image',
  'note',
  'other',
];

const collectionReasons: CollectionReason[] = [
  'read_later',
  'learn_later',
  'buy_later',
  'reference',
  'inspiration',
  'fear_of_losing',
  'interesting',
  'unknown',
];

const historyEventTypes: CollectionEventType[] = [
  'created',
  'updated',
  'opened',
  'processed',
  'archived',
  'postponed',
  'deleted',
  'abandoned',
  'converted',
  'note_added',
];

export interface CollectionBackup {
  app: typeof BACKUP_APP;
  schemaVersion: typeof BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  items: CollectionItem[];
  history: CollectionHistoryEntry[];
}

export interface BackupSummary {
  exportedAt: string;
  schemaVersion: number;
  itemCount: number;
  historyCount: number;
}

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function fail(message: string): never {
  throw new BackupValidationError(message);
}

function validateItem(value: unknown, index: number): asserts value is CollectionItem {
  if (!isRecord(value)) {
    fail(`Item ${index + 1} must be an object.`);
  }

  if (!isNonEmptyString(value.id)) fail(`Item ${index + 1} is missing a valid id.`);
  if (!isNonEmptyString(value.title)) fail(`Item ${index + 1} is missing a valid title.`);
  if (!collectionStatuses.includes(value.status as CollectionStatus)) {
    fail(`Item ${index + 1} has an unsupported status.`);
  }
  if (!contentTypes.includes(value.type as ContentType)) {
    fail(`Item ${index + 1} has an unsupported type.`);
  }
  if (!collectionReasons.includes(value.reason as CollectionReason)) {
    fail(`Item ${index + 1} has an unsupported reason.`);
  }
  if (!isNonEmptyString(value.source)) fail(`Item ${index + 1} is missing a valid source.`);
  if (!isIsoDate(value.collectedAt)) {
    fail(`Item ${index + 1} is missing a valid collectedAt date.`);
  }
  if (![1, 2, 3, 4, 5].includes(value.importance as number)) {
    fail(`Item ${index + 1} has an invalid importance.`);
  }
  if (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === 'string')) {
    fail(`Item ${index + 1} must have a tags array.`);
  }

  const optionalStringFields = ['url', 'description', 'notes'] as const;
  const optionalDateFields = [
    'lastOpenedAt',
    'lastReviewedAt',
    'processedAt',
    'expiresAt',
  ] as const;

  for (const field of optionalStringFields) {
    if (!isOptionalString(value[field])) {
      fail(`Item ${index + 1} has an invalid ${field} field.`);
    }
  }

  for (const field of optionalDateFields) {
    if (value[field] !== undefined && !isIsoDate(value[field])) {
      fail(`Item ${index + 1} has an invalid ${field} date.`);
    }
  }

  if (
    value.estimatedMinutes !== undefined &&
    (typeof value.estimatedMinutes !== 'number' ||
      !Number.isFinite(value.estimatedMinutes) ||
      value.estimatedMinutes < 0)
  ) {
    fail(`Item ${index + 1} has an invalid estimatedMinutes field.`);
  }
}

function validateHistoryEntry(
  value: unknown,
  index: number,
): asserts value is CollectionHistoryEntry {
  if (!isRecord(value)) {
    fail(`History entry ${index + 1} must be an object.`);
  }

  if (!isNonEmptyString(value.id)) fail(`History entry ${index + 1} is missing a valid id.`);
  if (!isNonEmptyString(value.itemId)) {
    fail(`History entry ${index + 1} is missing a valid itemId.`);
  }
  if (!historyEventTypes.includes(value.type as CollectionEventType)) {
    fail(`History entry ${index + 1} has an unsupported type.`);
  }
  if (!isIsoDate(value.createdAt)) {
    fail(`History entry ${index + 1} is missing a valid createdAt date.`);
  }
  if (!isOptionalString(value.note)) {
    fail(`History entry ${index + 1} has an invalid note field.`);
  }
}

function rejectDuplicateIds(values: Array<{ id: string }>, label: string) {
  const ids = new Set<string>();

  for (const value of values) {
    if (ids.has(value.id)) {
      fail(`${label} contains duplicate id "${value.id}".`);
    }
    ids.add(value.id);
  }
}

export function createBackup(
  items: CollectionItem[],
  history: CollectionHistoryEntry[],
  exportedAt = new Date(),
): CollectionBackup {
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    items,
    history,
  };
}

export function validateBackup(data: unknown): CollectionBackup {
  if (!isRecord(data)) fail('Backup must be a JSON object.');
  if (data.app !== BACKUP_APP) fail('This file is not a collection-cleaner backup.');
  if (data.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    fail(`Unsupported backup schemaVersion. Only version ${BACKUP_SCHEMA_VERSION} is supported.`);
  }
  if (!isIsoDate(data.exportedAt)) fail('Backup exportedAt must be a valid ISO date.');
  if (!Array.isArray(data.items)) fail('Backup items must be an array.');
  if (data.history !== undefined && !Array.isArray(data.history)) {
    fail('Backup history must be an array.');
  }

  data.items.forEach(validateItem);
  const history = data.history ?? [];
  history.forEach(validateHistoryEntry);
  rejectDuplicateIds(data.items, 'Backup items');
  rejectDuplicateIds(history, 'Backup history');

  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: data.exportedAt,
    items: data.items,
    history,
  };
}

export function parseBackupJson(text: string): CollectionBackup {
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupValidationError('The selected file is not valid JSON.');
  }

  return validateBackup(data);
}

export function summarizeBackup(backup: CollectionBackup): BackupSummary {
  return {
    exportedAt: backup.exportedAt,
    schemaVersion: backup.schemaVersion,
    itemCount: backup.items.length,
    historyCount: backup.history.length,
  };
}
