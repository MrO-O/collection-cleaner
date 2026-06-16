import { Link, useParams } from 'react-router-dom';

import { useCollections } from '../store/useCollections';
import type { CollectionEventType } from '../types/collection';
import { calculateDustScore, getDustDays, getDustLevel } from '../utils/dustScore';

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function ItemDetail() {
  const { id } = useParams();
  const { actions, error, getHistoryForItem, getItemById, loading } = useCollections();

  if (loading) {
    return (
      <PageState title="Loading collection item" description="Reading local IndexedDB data..." />
    );
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  const item = id ? getItemById(id) : undefined;

  if (!item) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Collection item not found</h3>
        <p className="mt-2 text-sm text-ink-500">
          This item may have been removed from the in-memory mock store.
        </p>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-900" to="/collections">
          Back to collection list
        </Link>
      </div>
    );
  }

  const history = getHistoryForItem(item.id);

  function openLink() {
    if (!item?.url) {
      return;
    }

    actions.openItem(item.id);
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <article className="space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link className="text-sm font-medium text-emerald-900" to="/collections">
              Back to collection list
            </Link>
            <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
            {item.url ? (
              <p className="mt-2 break-all text-sm text-ink-500">{item.url}</p>
            ) : (
              <p className="mt-2 text-sm text-ink-500">{item.source}</p>
            )}
          </div>
          <span className="w-fit rounded-md bg-stone-100 px-3 py-1 text-sm font-semibold uppercase text-ink-700">
            {formatLabel(item.status)}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-emerald-800 hover:text-emerald-900"
            to={`/collections/${item.id}/edit`}
          >
            Edit
          </Link>
          {item.url ? (
            <button
              className="rounded-md bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
              onClick={openLink}
              type="button"
            >
              Open link
            </button>
          ) : null}
          <ActionButton label="Mark processed" onClick={() => actions.markProcessed(item.id)} />
          <ActionButton label="Archive" onClick={() => actions.archiveItem(item.id)} />
          <ActionButton label="Postpone 7 days" onClick={() => actions.postponeItem(item.id, 7)} />
          <ActionButton label="Delete" onClick={() => actions.deleteItem(item.id)} tone="danger" />
          <ActionButton label="Abandon" onClick={() => actions.abandonItem(item.id)} />
          <ActionButton label="Convert" onClick={() => actions.convertItem(item.id)} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Dust days" value={`${getDustDays(item)} days`} />
        <MetricCard label="Dust score" value={String(calculateDustScore(item))} />
        <MetricCard label="Dust level" value={getDustLevel(item)} />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h4 className="font-semibold">Metadata</h4>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <MetaItem label="Content type" value={formatLabel(item.type)} />
          <MetaItem label="Reason" value={formatLabel(item.reason)} />
          <MetaItem label="Source" value={item.source} />
          <MetaItem label="Priority" value={`P${item.importance}`} />
          <MetaItem label="Collected at" value={formatDateTime(item.collectedAt)} />
          {item.lastOpenedAt ? (
            <MetaItem label="Last opened" value={formatDateTime(item.lastOpenedAt)} />
          ) : null}
          {item.expiresAt ? (
            <MetaItem label="Expires at" value={formatDateTime(item.expiresAt)} />
          ) : null}
          {item.processedAt ? (
            <MetaItem label="Processed at" value={formatDateTime(item.processedAt)} />
          ) : null}
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs font-semibold uppercase text-ink-500">Tags</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-ink-700"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {item.notes ? (
        <section className="rounded-lg border border-stone-200 bg-white p-5">
          <h4 className="font-semibold">Notes</h4>
          <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">{item.notes}</p>
        </section>
      ) : null}

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h4 className="font-semibold">Processing timeline</h4>
        {history.length > 0 ? (
          <ol className="mt-4 space-y-4">
            {history.map((entry) => (
              <li className="border-l-2 border-stone-200 pl-4" key={entry.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold capitalize">{eventLabel(entry.type)}</p>
                  <time className="text-xs text-ink-500">{formatDateTime(entry.createdAt)}</time>
                </div>
                {entry.note ? <p className="mt-1 text-sm text-ink-500">{entry.note}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No processing events yet.</p>
        )}
      </section>
    </article>
  );
}

function eventLabel(type: CollectionEventType): string {
  return formatLabel(type);
}

function ActionButton({
  label,
  onClick,
  tone = 'default',
}: {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  const className =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-800 hover:border-red-500'
      : 'border-stone-300 bg-white text-ink-700 hover:border-emerald-800 hover:text-emerald-900';

  return (
    <button
      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${className}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold capitalize">{value}</p>
    </div>
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

function PageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      <Link className="mt-4 inline-block text-sm font-medium text-emerald-900" to="/collections">
        Back to collection list
      </Link>
    </div>
  );
}
