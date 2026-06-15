import { NavLink, Outlet } from 'react-router-dom';

const navigationItems = [
  { label: '首页', to: '/' },
  { label: '收藏', to: '/collections' },
  { label: '导入', to: '/import' },
  { label: '统计', to: '/stats' },
  { label: '设置', to: '/settings' },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-ink-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white/70 px-5 py-6 lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Local first</p>
            <h1 className="mt-2 text-2xl font-semibold">collection-cleaner</h1>
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-emerald-900 text-white'
                      : 'text-ink-700 hover:bg-stone-100 hover:text-ink-950',
                  ].join(' ')
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-stone-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink-500">收藏清理工作台</span>
              <h2 className="text-2xl font-semibold">让长期吃灰的内容重新回到处理队列</h2>
            </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-stone-200 bg-white lg:hidden">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'px-2 py-3 text-center text-xs font-medium',
                isActive ? 'text-emerald-900' : 'text-ink-500',
              ].join(' ')
            }
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
