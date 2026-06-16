import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import type { CollectionItemInput, CollectionReason, ContentType } from '../types/collection';
import {
  type CollectionFormValues,
  formValuesToInput,
  hasCollectionFormErrors,
  validateCollectionForm,
} from '../utils/collectionForm';

const typeOptions: ContentType[] = [
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

const reasonOptions: CollectionReason[] = [
  'read_later',
  'learn_later',
  'buy_later',
  'reference',
  'inspiration',
  'fear_of_losing',
  'interesting',
  'unknown',
];

function label(value: string): string {
  return value.replace(/_/g, ' ');
}

export function CollectionForm({
  initialValues,
  onSubmit,
  submitLabel,
}: {
  initialValues: CollectionFormValues;
  onSubmit: (input: CollectionItemInput) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(validateCollectionForm(initialValues));
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateValue<Key extends keyof CollectionFormValues>(
    key: Key,
    value: CollectionFormValues[Key],
  ) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    setErrors(validateCollectionForm(nextValues));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCollectionForm(values);
    setErrors(nextErrors);

    if (hasCollectionFormErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formValuesToInput(values));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save collection item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitError}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 md:grid-cols-2">
        <Field label="Title" error={errors.title}>
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('title', event.target.value)}
            required
            value={values.title}
          />
        </Field>

        <Field label="URL" error={errors.url}>
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('url', event.target.value)}
            placeholder="https://example.com"
            type="url"
            value={values.url}
          />
        </Field>

        <Field label="Source">
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('source', event.target.value)}
            placeholder="manual, newsletter, GitHub stars..."
            value={values.source}
          />
        </Field>

        <Field label="Content type">
          <select
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('type', event.target.value as ContentType)}
            value={values.type}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Reason">
          <select
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('reason', event.target.value as CollectionReason)}
            value={values.reason}
          >
            {reasonOptions.map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority" error={errors.importance}>
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            max={5}
            min={1}
            onChange={(event) => updateValue('importance', event.target.value)}
            type="number"
            value={values.importance}
          />
        </Field>

        <Field label="Tags">
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('tags', event.target.value)}
            placeholder="learning, video, later"
            value={values.tags}
          />
        </Field>

        <Field label="Expires at">
          <input
            className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('expiresAt', event.target.value)}
            type="date"
            value={values.expiresAt}
          />
        </Field>

        <Field label="Notes" wide>
          <textarea
            className="min-h-28 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/10"
            onChange={(event) => updateValue('notes', event.target.value)}
            value={values.notes}
          />
        </Field>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md bg-emerald-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
  wide = false,
}: {
  children: ReactNode;
  error?: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
      <span className="text-xs font-semibold uppercase text-ink-500">{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
