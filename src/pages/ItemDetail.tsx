import { Link, useParams } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import { calculateDustScore, getDustDays, getDustLevel, isExpired } from '../utils/dustScore';

export function ItemDetail() {
  const { itemId } = useParams();
  const item = mockItems.find((candidate) => candidate.id === itemId);

  if (!item) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="text-xl font-semibold">Collection item not found</h3>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-900" to="/collections">
          Back to collection list
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-emerald-900" to="/collections">
          Back to collection list
        </Link>
        <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm text-ink-500">{item.description ?? item.source}</p>
        {item.url ? <p className="mt-2 break-all text-sm text-ink-500">{item.url}</p> : null}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Dust score</p>
          <p className="mt-2 text-3xl font-semibold">{calculateDustScore(item)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Dust level</p>
          <p className="mt-2 text-lg font-semibold">{getDustLevel(item)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Status</p>
          <p className="mt-2 text-lg font-semibold">{item.status}</p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h4 className="font-semibold">Collection metadata</h4>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">Type</dt>
            <dd className="mt-1 font-medium">{item.type}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Reason</dt>
            <dd className="mt-1 font-medium">{item.reason}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Source</dt>
            <dd className="mt-1 font-medium">{item.source}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Dust days</dt>
            <dd className="mt-1 font-medium">{getDustDays(item)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Collected at</dt>
            <dd className="mt-1 font-medium">{new Date(item.collectedAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Expired</dt>
            <dd className="mt-1 font-medium">{isExpired(item) ? 'Yes' : 'No'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-ink-500">Tags</dt>
            <dd className="mt-1 font-medium">{item.tags.join(', ') || 'None'}</dd>
          </div>
          {item.notes ? (
            <div className="sm:col-span-2">
              <dt className="text-ink-500">Notes</dt>
              <dd className="mt-1 font-medium">{item.notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </article>
  );
}
