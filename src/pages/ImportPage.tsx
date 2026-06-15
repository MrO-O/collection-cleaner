export function ImportPage() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">导入</h3>
        <p className="mt-1 text-sm text-ink-500">本阶段仅预留导入入口，暂不解析外部文件。</p>
      </div>
      <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="text-lg font-semibold">后续支持书签、CSV、JSON 或手动粘贴链接</p>
        <p className="mt-2 text-sm text-ink-500">当前页面用于确认导航和布局结构。</p>
      </section>
    </div>
  );
}
