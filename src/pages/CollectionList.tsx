import { Link } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import { calculateDustScore } from '../utils/dustScore';

export function CollectionList() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">收藏列表</h3>
        <p className="mt-1 text-sm text-ink-500">当前使用假数据展示，后续接入 Dexie 本地库。</p>
      </div>

      <div className="grid gap-4">
        {mockItems.map((item) => (
          <Link
            className="rounded-lg border border-stone-200 bg-white p-5 transition hover:border-emerald-800"
            key={item.id}
            to={`/collections/${item.id}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="mt-2 break-all text-sm text-ink-500">{item.url}</p>
              </div>
              <span className="w-fit rounded-md bg-stone-100 px-3 py-1 text-sm font-medium text-ink-700">
                {item.type}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink-500">
              <span>状态：{item.status}</span>
              <span>原因：{item.reason}</span>
              <span>吃灰分：{calculateDustScore(item)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
