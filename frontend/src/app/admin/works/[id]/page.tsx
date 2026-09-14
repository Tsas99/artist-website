'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import WorkInfoEditor, {
  type Work,
} from '@/components/admin/WorkInfoEditor';

import WorkMediaManager from '@/components/admin/WorkMediaManager';
import WorkPublishToggle from '@/components/admin/WorkPublishToggle';
import DeleteWork from '@/components/admin/DeleteWork';
import { API_URL } from '@/lib/api';

export default function AdminWorkDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function loadWork() {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/works/${id}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load work');
        }

        const data: Work = await response.json();

        setWork(data);
      } catch (error) {
        console.error(error);
        setError('Work could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    loadWork();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-sm text-neutral-500">
            Loading work...
          </p>
        </div>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-sm text-red-600">
            {error || 'Work not found.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/admin/works')}
              className="mb-4 text-sm text-neutral-500 transition hover:text-neutral-950"
            >
              ← Back to works
            </button>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              {work.title}
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage artwork
            </p>
          </div>

          <WorkPublishToggle
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">


          <WorkInfoEditor
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
          <WorkMediaManager
            work={work}
            onWorkChange={setWork}
            onError={setError}
          />
        </div>

      </div>
    </main>
  );
}


