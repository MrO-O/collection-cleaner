import { Link } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import {
  calculateDustScore,
  getDustDays,
  getDustLevel,
  isExpired,
  sortByDustScore,
} from '../utils/dustScore';

export function CollectionList() {
  const sortedItems = sortByDustScore(mockItems);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Collection list</h3>
        <p className="mt-1 text-sm text-ink-500">
          Mock data sorted by dust score. Real Dexie persistence is intentionally not connected yet.
        </p>
      </div>

      <div className="grid gap-4">
        {sortedItems.map((item) => (
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 transition hover:border-emerald-800"
            key={item.id}
            to={`/collections/${item.id}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-ink-500">{item.description ?? item.source}</p>
                {item.url ? (
                  <p className="mt-1 break-all text-sm text-ink-500">{item.url}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <span className="w-fit rounded-md bg-stone-100 px-3 py-1 text-sm font-medium text-ink-700">
                  {item.type}
                </span>
                <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  {getDustLevel(item)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink-500">
              <span>Status: {item.status}</span>
              <span>Reason: {item.reason}</span>
              <span>Dust days: {getDustDays(item)}</span>
              <span>Score: {calculateDustScore(item)}</span>
              {isExpired(item) ? <span className="font-medium text-red-700">Expired</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
