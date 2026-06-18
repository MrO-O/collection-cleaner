import { Link } from 'react-router-dom';

import { useCollections } from '../store/useCollections';
import type { CollectionItem } from '../types/collection';
import { getTodayCleanupItems, isCleanupCandidate } from '../utils/cleanup';
import { calculateDustScore, getDustDays, getDustLevel } from '../utils/dustScore';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

function formatExpiry(item: CollectionItem, now: Date): string {
  if (!item.expiresAt) {
    return 'No expiry date';
  }

  const difference = new Date(item.expiresAt).getTime() - now.getTime();

  if (difference < 0) {
    const days = Math.max(1, Math.ceil(Math.abs(difference) / DAY_IN_MS));
    return `Expired ${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const days = Math.ceil(difference / DAY_IN_MS);

  if (days === 0) {
    return 'Expires today';
  }

  return `Expires in ${days} ${days === 1 ? 'day' : 'days'}`;
}

export function Dashboard() {
  const { actions, error, items, loading } = useCollections();

  if (loading) {
    return <PageState title="Loading collections" description="Reading local IndexedDB data..." />;
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  const now = new Date();
  const cleanupItems = getTodayCleanupItems(items, { now });
  const pendingCount = items.filter(isCleanupCandidate).length;
  const oldestDustDays = items.reduce(
    (oldest, item) => Math.max(oldest, getDustDays(item, now)),
    0,
  );

  function openItem(item: CollectionItem) {
    if (!item.url) {
      return;
    }

    actions.openItem(item.id);
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total collections" value={items.length} />
        <MetricCard label="Pending cleanup" value={pendingCount} />
        <MetricCard label="Today recommended" value={cleanupItems.length} />
        <MetricCard label="Oldest dust days" value={oldestDustDays} />
      </section>

      <section className="border-y border-stone-200 bg-white py-5 sm:rounded-lg sm:border">
        <div className="flex flex-col gap-2 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div>
            <h3 className="text-lg font-semibold">Today&apos;s cleanup</h3>
            <p className="mt-1 text-sm text-ink-500">
              Up to three saved items with the strongest reason to act today.
            </p>
          </div>
          <Link className="text-sm font-medium text-emerald-900" to="/collections">
            View all collections
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            actionLabel="Add first collection"
            description="Your mental inventory is 0. Add the first collection item to start a cleanup queue."
            title="No collections yet"
            to="/collections/new"
          />
        ) : cleanupItems.length === 0 ? (
          <EmptyState
            actionLabel="View all collections"
            description="Everything currently saved is already processed, archived, deleted, abandoned, or converted."
            title="Nothing needs cleanup today"
            to="/collections"
          />
        ) : (
          <div className="mt-5 grid gap-3 px-4 lg:grid-cols-3 sm:px-5">
            {cleanupItems.map((item) => (
              <CleanupCard
                item={item}
                key={item.id}
                now={now}
                onAbandon={() => actions.abandonItem(item.id)}
                onArchive={() => actions.archiveItem(item.id)}
                onOpen={() => openItem(item)}
                onPostpone={() => actions.postponeItem(item.id, 7)}
                onProcess={() => actions.markProcessed(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CleanupCard({
  item,
  now,
  onAbandon,
  onArchive,
  onOpen,
  onPostpone,
  onProcess,
}: {
  item: CollectionItem;
  now: Date;
  onAbandon: () => void;
  onArchive: () => void;
  onOpen: () => void;
  onPostpone: () => void;
  onProcess: () => void;
}) {
  const dustDays = getDustDays(item, now);
  const dustScore = calculateDustScore(item, now);
  const dustLevel = getDustLevel(item, now);

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-wrap gap-2">
        <Badge>{item.type}</Badge>
        <Badge>{item.reason}</Badge>
        <Badge>{item.status}</Badge>
      </div>

      <Link
        className="mt-3 text-base font-semibold text-ink-950 transition hover:text-emerald-900"
        to={`/collections/${item.id}`}
      >
        {item.title}
      </Link>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MetaItem label="Collected" value={formatDate(item.collectedAt)} />
        <MetaItem label="Dust" value={`${dustDays} days`} />
        <MetaItem label="Dust level" value={formatLabel(dustLevel)} />
        <MetaItem label="Dust score" value={String(dustScore)} />
      </dl>

      <p
        className={`mt-4 text-sm font-medium ${item.expiresAt && new Date(item.expiresAt) < now ? 'text-red-700' : 'text-ink-500'}`}
      >
        {formatExpiry(item, now)}
      </p>

      {item.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span className="rounded-md bg-white px-2 py-1 text-xs text-ink-700" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {item.url ? <ActionButton label="Open" onClick={onOpen} primary /> : null}
        <ActionButton label="Mark processed" onClick={onProcess} />
        <ActionButton label="Postpone 7 days" onClick={onPostpone} />
        <ActionButton label="Archive" onClick={onArchive} />
        <ActionButton label="Abandon" onClick={onAbandon} />
      </div>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold uppercase text-ink-700">
      {formatLabel(children)}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-ink-500">{label}</dt>
      <dd className="mt-1 font-medium text-ink-950">{value}</dd>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const className = primary
    ? 'border-emerald-900 bg-emerald-900 text-white'
    : 'border-stone-300 bg-white text-ink-700 hover:border-emerald-800 hover:text-emerald-900';

  return (
    <button
      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${className}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function EmptyState({
  actionLabel,
  description,
  title,
  to,
}: {
  actionLabel: string;
  description: string;
  title: string;
  to: string;
}) {
  return (
    <div className="mt-5 border-t border-stone-100 px-4 pt-5 sm:px-5">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>
      <Link
        className="mt-4 inline-flex rounded-md bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
        to={to}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function PageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
    </div>
  );
}
