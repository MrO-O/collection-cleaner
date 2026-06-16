import { useState } from 'react';

import { useCollections } from '../store/useCollections';

export function SettingsPage() {
  const { actions, error, items, loading } = useCollections();
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [operating, setOperating] = useState(false);

  async function runOperation(operation: () => Promise<string>) {
    setOperating(true);
    setOperationError(null);
    setOperationMessage(null);

    try {
      const message = await operation();
      setOperationMessage(message);
    } catch (operationFailure) {
      setOperationError(
        operationFailure instanceof Error
          ? operationFailure.message
          : 'Local data operation failed.',
      );
    } finally {
      setOperating(false);
    }
  }

  function handleClearData() {
    const confirmed = window.confirm(
      'Clear all local collection data? This removes collection items and timeline history from this browser.',
    );

    if (!confirmed) {
      return;
    }

    void runOperation(async () => {
      await actions.clearAllCollections();
      return 'All local collection data has been cleared.';
    });
  }

  function handleLoadDemoData() {
    if (
      items.length > 0 &&
      !window.confirm(
        'Load demo data? This will replace all current local collection items and timeline history.',
      )
    ) {
      return;
    }

    void runOperation(async () => {
      const count = await actions.loadDemoCollections();
      return `Loaded ${count} demo collection items.`;
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Settings</h3>
        <p className="mt-1 text-sm text-ink-500">Manage local-only data stored in this browser.</p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-semibold">Local data</p>
            <p className="mt-1 text-sm text-ink-500">
              {items.length} collection items are currently stored in IndexedDB.
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Demo data is opt-in and will not load automatically on startup.
            </p>
          </div>
          <span className="w-fit rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
            Local first
          </span>
        </div>

        {loading ? <p className="mt-4 text-sm text-ink-500">Reading local data...</p> : null}
        {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}
        {operationError ? (
          <p className="mt-4 text-sm font-medium text-red-700">{operationError}</p>
        ) : null}
        {operationMessage ? (
          <p className="mt-4 text-sm font-medium text-emerald-900">{operationMessage}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || operating}
            onClick={handleClearData}
            type="button"
          >
            Clear all local data
          </button>
          <button
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-emerald-800 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || operating}
            onClick={handleLoadDemoData}
            type="button"
          >
            Load demo data
          </button>
        </div>
      </section>
    </div>
  );
}
