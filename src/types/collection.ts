export type ContentType = 'article' | 'video' | 'product' | 'course' | 'paper' | 'webpage' | 'other';

export type CollectionStatus = 'unread' | 'inProgress' | 'archived' | 'deleted' | 'reviewed';

export type CollectionReason =
  | 'learnLater'
  | 'buyLater'
  | 'reference'
  | 'research'
  | 'work'
  | 'inspiration'
  | 'unsure';

export interface CollectionItem {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  status: CollectionStatus;
  reason: CollectionReason;
  source: string;
  addedAt: string;
  lastOpenedAt?: string;
  tags: string[];
  notes?: string;
}
