import { Link, useParams } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import { calculateDustScore } from '../utils/dustScore';

export function ItemDetail() {
  const { itemId } = useParams();
  const item = mockItems.find((candidate) => candidate.id === itemId);

  if (!item) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="text-xl font-semibold">未找到收藏项</h3>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-900" to="/collections">
          返回收藏列表
        </Link>
      </div>
    );
  }

  return (
    <article className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-emerald-900" to="/collections">
          返回收藏列表
        </Link>
        <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
        <p className="mt-2 break-all text-sm text-ink-500">{item.url}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">吃灰分</p>
          <p className="mt-2 text-3xl font-semibold">{calculateDustScore(item)}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm text-ink-500">处理状态</p>
          <p className="mt-2 text-lg font-semibold">{item.status}</p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h4 className="font-semibold">基础信息</h4>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-500">类型</dt>
            <dd className="mt-1 font-medium">{item.type}</dd>
          </div>
          <div>
            <dt className="text-ink-500">收藏原因</dt>
            <dd className="mt-1 font-medium">{item.reason}</dd>
          </div>
          <div>
            <dt className="text-ink-500">来源</dt>
            <dd className="mt-1 font-medium">{item.source}</dd>
          </div>
          <div>
            <dt className="text-ink-500">标签</dt>
            <dd className="mt-1 font-medium">{item.tags.join(', ') || '无'}</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
