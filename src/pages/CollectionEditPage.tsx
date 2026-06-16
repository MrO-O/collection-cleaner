import { Link, useNavigate, useParams } from 'react-router-dom';

import { CollectionForm } from '../components/CollectionForm';
import { useCollections } from '../store/useCollections';
import type { CollectionItemInput } from '../types/collection';
import { collectionToFormValues } from '../utils/collectionForm';

export function CollectionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, error, getItemById, loading } = useCollections();
  const item = id ? getItemById(id) : undefined;

  async function handleSubmit(input: CollectionItemInput) {
    if (!item) {
      return;
    }

    const saved = await actions.updateCollection(item.id, input);

    if (!saved) {
      throw new Error('Collection item no longer exists.');
    }

    navigate(`/collections/${item.id}`);
  }

  if (loading) {
    return (
      <PageState title="Loading collection item" description="Reading local IndexedDB data..." />
    );
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  if (!item) {
    return (
      <PageState
        title="Collection item not found"
        description="This item may have been removed from local storage."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link className="text-sm font-medium text-emerald-900" to={`/collections/${item.id}`}>
          Back to detail
        </Link>
        <h3 className="mt-3 text-xl font-semibold">Edit collection</h3>
        <p className="mt-1 text-sm text-ink-500">Update editable metadata for this item.</p>
      </div>

      <CollectionForm
        initialValues={collectionToFormValues(item)}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}

function PageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
      <Link className="mt-4 inline-block text-sm font-medium text-emerald-900" to="/collections">
        Back to collection list
      </Link>
    </div>
  );
}
