import { Link } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import { calculateDustScore } from '../utils/dustScore';

export function Dashboard() {
  const staleItems = mockItems
    .map((item) => ({ item, dustScore: calculateDustScore(item) }))
    .sort((left, right) => right.dustScore - left.dustScore);
  const topItem = staleItems[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">待处理收藏</p>
          <p className="mt-3 text-3xl font-semibold">{mockItems.length}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">最高吃灰分</p>
          <p className="mt-3 text-3xl font-semibold">{topItem?.dustScore ?? 0}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">今日建议</p>
          <p className="mt-3 text-lg font-semibold">先复盘 1 条长期未打开内容</p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="text-lg font-semibold">今日清理概览</h3>
          <Link className="text-sm font-medium text-emerald-900" to="/collections">
            查看全部
          </Link>
        </div>
        <div className="divide-y divide-stone-100">
          {staleItems.slice(0, 3).map(({ item, dustScore }) => (
            <Link
              className="flex flex-col gap-2 px-5 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
              key={item.id}
              to={`/collections/${item.id}`}
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {item.source} · {item.type} · {item.reason}
                </p>
              </div>
              <span className="w-fit rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                吃灰分 {dustScore}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
