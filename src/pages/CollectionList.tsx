import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { mockItems } from '../data/mockItems';
import type {
  CollectionReason,
  CollectionStatus,
  ContentType,
  DustLevel,
} from '../types/collection';
import {
  type CollectionListFilters,
  type CollectionSortOption,
  defaultCollectionListFilters,
  getCollectionListItems,
} from '../utils/collectionList';
import { calculateDustScore, getDustDays, getDustLevel } from '../utils/dustScore';

const statusOptions: Array<'all' | CollectionStatus> = [
  'all',
  'new',
  'cooling',
  'pending',
  'processed',
  'archived',
  'deleted',
  'abandoned',
  'converted',
];
const typeOptions: Array<'all' | ContentType> = [
  'all',
  'article',
  'video',
  'product',
  'course',
  'paper',
  'repo',
  'image',
  'note',
  'other',
];
const reasonOptions: Array<'all' | CollectionReason> = [
  'all',
  'read_later',
  'learn_later',
  'buy_later',
  'reference',
  'inspiration',
  'fear_of_losing',
  'interesting',
  'unknown',
];
const dustLevelOptions: Array<'all' | DustLevel> = [
  'all',
  'fresh',
  'light',
  'dusty',
  'stale',
  'buried',
];
const sortOptions: Array<{ label: string; value: CollectionSortOption }> = [
  { label: 'Dust days', value: 'dust_days_desc' },
  { label: 'Dust score', value: 'dust_score_desc' },
  { label: 'Recent collection', value: 'collected_desc' },
  { label: 'Priority', value: 'importance_desc' },
];

function formatOptionLabel(value: string): string {
  return value === 'all' ? 'All' : value.replace(/_/g, ' ');
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

export function CollectionList() {
  const [filters, setFilters] = useState<CollectionListFilters>(defaultCollectionListFilters);
  const [sortBy, setSortBy] = useState<CollectionSortOption>('dust_score_desc');
  const visibleItems = useMemo(
    () => getCollectionListItems(mockItems, filters, sortBy),
    [filters, sortBy],
  );

  function updateFilter<Key extends keyof CollectionListFilters>(
    key: Key,
    value: CollectionListFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Collection list</h3>
          <p className="mt-1 text-sm text-ink-500">
            {visibleItems.length} of {mockItems.length} mock items shown.
          </p>
        </div>
        <button
          className="w-fit rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-emerald-800 hover:text-emerald-900"
          onClick={() => {
            setFilters(defaultCollectionListFilters);
            setSortBy('dust_score_desc');
          }}
          type="button"
        >
          Reset
        </button>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(5,minmax(0,1fr))]">
          <label className="min-w-0 space-y-1">
            <span className="text-xs font-semibold uppercase text-ink-500">Search</span>
            <input
              className="h-10 w-full min-w-0 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
              onChange={(event) => updateFilter('query', event.target.value)}
              placeholder="Title, URL, or tag"
              type="search"
              value={filters.query}
            />
          </label>

          <FilterSelect
            label="Status"
            onChange={(value) => updateFilter('status', value as CollectionListFilters['status'])}
            options={statusOptions}
            value={filters.status}
          />
          <FilterSelect
            label="Type"
            onChange={(value) => updateFilter('type', value as CollectionListFilters['type'])}
            options={typeOptions}
            value={filters.type}
          />
          <FilterSelect
            label="Reason"
            onChange={(value) => updateFilter('reason', value as CollectionListFilters['reason'])}
            options={reasonOptions}
            value={filters.reason}
          />
          <FilterSelect
            label="Dust level"
            onChange={(value) =>
              updateFilter('dustLevel', value as CollectionListFilters['dustLevel'])
            }
            options={dustLevelOptions}
            value={filters.dustLevel}
          />
          <label className="min-w-0 space-y-1">
            <span className="text-xs font-semibold uppercase text-ink-500">Sort</span>
            <select
              className="h-10 w-full min-w-0 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
              onChange={(event) => setSortBy(event.target.value as CollectionSortOption)}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="space-y-3">
        {visibleItems.map((item) => {
          const dustLevel = getDustLevel(item);

          return (
            <Link
              className="block rounded-lg border border-stone-200 bg-white p-4 transition hover:border-emerald-800 hover:bg-stone-50 sm:p-5"
              key={item.id}
              to={`/collections/${item.id}`}
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <h4 className="text-base font-semibold text-ink-950 sm:text-lg">{item.title}</h4>
                  <p className="mt-2 break-all text-sm text-ink-500">{item.url ?? item.source}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
                  <Badge>{item.type}</Badge>
                  <Badge>{item.reason}</Badge>
                  <Badge>{item.status}</Badge>
                  <DustBadge level={dustLevel} />
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <MetaItem label="Collected" value={formatDate(item.collectedAt)} />
                <MetaItem label="Dust days" value={`${getDustDays(item)} days`} />
                <MetaItem label="Dust score" value={String(calculateDustScore(item))} />
                <MetaItem label="Priority" value={`P${item.importance}`} />
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-ink-700"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}

        {visibleItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="font-semibold">No matching collection items</p>
            <p className="mt-2 text-sm text-ink-500">
              Adjust search or filters to show more items.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function FilterSelect({ label, options, value, onChange }: FilterSelectProps) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="text-xs font-semibold uppercase text-ink-500">{label}</span>
      <select
        className="h-10 w-full min-w-0 rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-stone-100 px-3 py-1 text-xs font-semibold uppercase text-ink-700">
      {children.replace(/_/g, ' ')}
    </span>
  );
}

function DustBadge({ level }: { level: DustLevel }) {
  const className =
    level === 'buried' || level === 'stale'
      ? 'bg-red-100 text-red-800'
      : level === 'dusty'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-emerald-100 text-emerald-900';

  return (
    <span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${className}`}>
      {level}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-ink-500">{label}</dt>
      <dd className="mt-1 font-medium text-ink-950">{value}</dd>
    </div>
  );
}
