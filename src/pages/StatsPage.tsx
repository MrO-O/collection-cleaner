import { Link } from 'react-router-dom';

import { useCollections } from '../store/useCollections';

export function StatsPage() {
  const { error, items, loading } = useCollections();
  const typeCounts = items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] ?? 0) + 1;
    return accumulator;
  }, {});

  if (loading) {
    return <PageState title="Loading stats" description="Reading local IndexedDB data..." />;
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Stats</h3>
        <p className="mt-1 text-sm text-ink-500">
          Basic local distribution from the collection items stored in this browser.
        </p>
      </div>

      {items.length === 0 ? (
        <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="font-semibold">No local data to summarize</p>
          <p className="mt-2 text-sm text-ink-500">
            Add a collection item or load demo data from Settings to see basic counts.
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-emerald-900 px-3 py-2 text-sm font-medium text-white"
            to="/collections/new"
          >
            Add first collection
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div className="rounded-lg border border-stone-200 bg-white p-5" key={type}>
              <p className="text-sm text-ink-500">{type}</p>
              <p className="mt-3 text-3xl font-semibold">{count}</p>
            </div>
          ))}
        </section>
      )}
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
