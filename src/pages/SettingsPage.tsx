import { useState, type ChangeEvent } from 'react';

import { useCollections } from '../store/useCollections';
import {
  createBackup,
  parseBackupJson,
  summarizeBackup,
  type CollectionBackup,
} from '../utils/backup';

function downloadBackup(backup: CollectionBackup) {
  const date = backup.exportedAt.slice(0, 10);
  const blob = new Blob([`${JSON.stringify(backup, null, 2)}\n`], {
    type: 'application/json',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `collection-cleaner-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

export function SettingsPage() {
  const { actions, error, history, items, loading } = useCollections();
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [operating, setOperating] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<CollectionBackup | null>(null);

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

  function handleExportBackup() {
    setOperationError(null);
    setOperationMessage(null);
    downloadBackup(createBackup(items, history));
    setOperationMessage(
      `Exported ${items.length} collection items and ${history.length} history records.`,
    );
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setOperating(true);
    setOperationError(null);
    setOperationMessage(null);
    setPendingBackup(null);

    try {
      const backup = parseBackupJson(await file.text());
      setPendingBackup(backup);
    } catch (importError) {
      setOperationError(
        importError instanceof Error ? importError.message : 'Could not read this backup file.',
      );
    } finally {
      setOperating(false);
    }
  }

  function handleRestoreBackup() {
    if (!pendingBackup) {
      return;
    }

    const confirmed = window.confirm(
      '这会替换当前浏览器中的全部收藏数据。建议先导出当前数据备份。是否继续？',
    );

    if (!confirmed) {
      return;
    }

    void runOperation(async () => {
      await actions.replaceAllCollections(pendingBackup.items, pendingBackup.history);
      const restoredCount = pendingBackup.items.length;
      setPendingBackup(null);
      return `Restored ${restoredCount} collection items from the JSON backup.`;
    });
  }

  const backupSummary = pendingBackup ? summarizeBackup(pendingBackup) : null;

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
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-emerald-800 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || operating}
            onClick={handleExportBackup}
            type="button"
          >
            Export JSON backup
          </button>
          <label className="cursor-pointer rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-emerald-800 hover:text-emerald-900 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
            Import JSON backup
            <input
              accept=".json,application/json"
              className="sr-only"
              disabled={loading || operating}
              onChange={(event) => void handleImportFile(event)}
              type="file"
            />
          </label>
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

        {pendingBackup && backupSummary ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-950">Import preview</p>
            <dl className="mt-3 grid gap-2 text-ink-700 sm:grid-cols-2">
              <div>
                <dt className="font-medium">Backup generated</dt>
                <dd>{new Date(backupSummary.exportedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="font-medium">Schema version</dt>
                <dd>{backupSummary.schemaVersion}</dd>
              </div>
              <div>
                <dt className="font-medium">Backup contents</dt>
                <dd>
                  {backupSummary.itemCount} items, {backupSummary.historyCount} history records
                </dd>
              </div>
              <div>
                <dt className="font-medium">Current local data</dt>
                <dd>{items.length} items</dd>
              </div>
            </dl>
            <p className="mt-3 font-medium text-amber-950">
              Importing will replace all collection items and timeline history currently stored in
              this browser. Export the current data first if it needs to be kept.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-md bg-amber-900 px-3 py-2 font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={operating}
                onClick={handleRestoreBackup}
                type="button"
              >
                Replace local data
              </button>
              <button
                className="rounded-md border border-amber-300 bg-white px-3 py-2 font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={operating}
                onClick={() => setPendingBackup(null)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h4 className="font-semibold">Browser access</h4>
        <p className="mt-2 text-sm text-ink-500">
          Bookmark this page to reopen Collection Cleaner like any other browser tool. Install it
          from your browser&apos;s app menu when PWA installation is supported.
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-ink-950">Current data origin</dt>
            <dd className="mt-1 break-all font-mono text-xs text-ink-500">
              {window.location.origin}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink-950">Storage note</dt>
            <dd className="mt-1 text-ink-500">
              Data stays in this browser&apos;s IndexedDB and is isolated by origin. Avoid mixing
              real data across different domains, ports, or browser profiles. Export a JSON backup
              before changing browsers, devices, or URLs.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
