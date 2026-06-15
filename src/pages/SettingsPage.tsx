export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">设置</h3>
        <p className="mt-1 text-sm text-ink-500">本阶段只提供静态设置占位。</p>
      </div>
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">本地优先模式</p>
            <p className="mt-1 text-sm text-ink-500">数据将优先保存在用户设备中。</p>
          </div>
          <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
            预留
          </span>
        </div>
      </section>
    </div>
  );
}
