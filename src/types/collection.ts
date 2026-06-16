export type ContentType =
  | 'article'
  | 'video'
  | 'product'
  | 'course'
  | 'paper'
  | 'repo'
  | 'image'
  | 'note'
  | 'other';

export type CollectionStatus =
  | 'new'
  | 'cooling'
  | 'pending'
  | 'processed'
  | 'archived'
  | 'deleted'
  | 'abandoned'
  | 'converted';

export type CollectionReason =
  | 'read_later'
  | 'learn_later'
  | 'buy_later'
  | 'reference'
  | 'inspiration'
  | 'fear_of_losing'
  | 'interesting'
  | 'unknown';

export type DustLevel = 'fresh' | 'light' | 'dusty' | 'stale' | 'buried';

export type CollectionEventType =
  | 'created'
  | 'updated'
  | 'opened'
  | 'processed'
  | 'archived'
  | 'postponed'
  | 'deleted'
  | 'abandoned'
  | 'converted'
  | 'note_added';

export interface CollectionHistoryEntry {
  id: string;
  itemId: string;
  type: CollectionEventType;
  createdAt: string;
  note?: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  type: ContentType;
  status: CollectionStatus;
  reason: CollectionReason;
  source: string;
  collectedAt: string;
  lastOpenedAt?: string;
  lastReviewedAt?: string;
  processedAt?: string;
  expiresAt?: string;
  estimatedMinutes?: number;
  importance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  notes?: string;
}

export interface CollectionItemInput {
  title: string;
  url?: string;
  source?: string;
  type: ContentType;
  reason: CollectionReason;
  importance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  notes?: string;
  expiresAt?: string;
}
