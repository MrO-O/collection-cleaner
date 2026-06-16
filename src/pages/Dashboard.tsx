import { Link } from 'react-router-dom';

import { useCollections } from '../store/useCollections';
import { calculateDustScore, getDustLevel, isExpired, sortByDustScore } from '../utils/dustScore';

export function Dashboard() {
  const { error, items, loading } = useCollections();

  if (loading) {
    return <PageState title="Loading collections" description="Reading local IndexedDB data..." />;
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  const staleItems = sortByDustScore(items).map((item) => ({
    item,
    dustScore: calculateDustScore(item),
    dustLevel: getDustLevel(item),
  }));
  const topItem = staleItems[0];
  const expiredCount = items.filter((item) => isExpired(item)).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Local items</p>
          <p className="mt-3 text-3xl font-semibold">{items.length}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Highest dust score</p>
          <p className="mt-3 text-3xl font-semibold">{topItem?.dustScore ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">Expired items</p>
          <p className="mt-3 text-3xl font-semibold">{expiredCount}</p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Today&apos;s cleanup overview</h3>
          <Link className="text-sm font-medium text-emerald-900" to="/collections">
            View all
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="p-6">
            <p className="font-semibold">No local collection items yet</p>
            <p className="mt-2 text-sm text-ink-500">
              Your mental inventory is 0. Add the first collection item to start tracking what has
              been waiting.
            </p>
            <Link
              className="mt-4 inline-flex rounded-md bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
              to="/collections/new"
            >
              Add first collection
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {staleItems.slice(0, 5).map(({ item, dustScore, dustLevel }) => (
              <Link
                className="flex flex-col gap-2 px-5 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                key={item.id}
                to={`/collections/${item.id}`}
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {item.source} / {item.type} / {item.reason}
                  </p>
                </div>
                <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  {dustLevel} / {dustScore}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
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
