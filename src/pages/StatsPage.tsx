import { mockItems } from '../data/mockItems';

const typeCounts = mockItems.reduce<Record<string, number>>((accumulator, item) => {
  accumulator[item.type] = (accumulator[item.type] ?? 0) + 1;
  return accumulator;
}, {});

export function StatsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">统计</h3>
        <p className="mt-1 text-sm text-ink-500">使用假数据展示基础分布，后续接入真实本地数据。</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div className="rounded-lg border border-stone-200 bg-white p-5" key={type}>
            <p className="text-sm text-ink-500">{type}</p>
            <p className="mt-3 text-3xl font-semibold">{count}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
