import { Link, useNavigate } from 'react-router-dom';

import { CollectionForm } from '../components/CollectionForm';
import { useCollections } from '../store/useCollections';
import type { CollectionItemInput } from '../types/collection';
import { defaultCollectionFormValues } from '../utils/collectionForm';

export function CollectionNewPage() {
  const navigate = useNavigate();
  const { actions, error, loading } = useCollections();

  async function handleSubmit(input: CollectionItemInput) {
    const itemId = await actions.createCollection(input);
    navigate(`/collections/${itemId}`);
  }

  if (loading) {
    return <PageState title="Loading collections" description="Reading local IndexedDB data..." />;
  }

  if (error) {
    return <PageState title="Collection storage error" description={error} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link className="text-sm font-medium text-emerald-900" to="/collections">
          Back to collection list
        </Link>
        <h3 className="mt-3 text-xl font-semibold">Add collection</h3>
        <p className="mt-1 text-sm text-ink-500">Create a local collection item.</p>
      </div>

      <CollectionForm
        initialValues={defaultCollectionFormValues}
        onSubmit={handleSubmit}
        submitLabel="Create collection"
      />
    </div>
  );
}

function PageState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-500">{description}</p>
    </div>
  );
}
