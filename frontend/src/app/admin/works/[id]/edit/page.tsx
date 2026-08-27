'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Work = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  mediums: string[];
  eventName: string | null;
  theme: string | null;
  place: string | null;
  material: string | null;
  dimensions: string | null;
  year: number | null;
  isPublished: boolean;
};

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [eventName, setEventName] = useState('');
  const [theme, setTheme] = useState('');
  const [place, setPlace] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadWork() {
      try {
        const response = await fetch(
          `http://localhost:3001/works/${id}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load work');
        }

        const work: Work = await response.json();

        setTitle(work.title);
        setSlug(work.slug);
        setDescription(work.description ?? '');
        setMedium(work.mediums.join(', '));
        setEventName(work.eventName ?? '');
        setTheme(work.theme ?? '');
        setPlace(work.place ?? '');
        setMaterial(work.material ?? '');
        setDimensions(work.dimensions ?? '');
        setYear(work.year ? String(work.year) : '');
        setIsPublished(work.isPublished);
      } catch (err) {
        console.error(err);
        setError('Work could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadWork();
    }
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3001/works/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            slug,
            description: description || undefined,
            mediums: medium
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            eventName: eventName || undefined,
            theme: theme || undefined,
            place: place || undefined,
            material: material || undefined,
            dimensions: dimensions || undefined,
            year: year ? Number(year) : undefined,
            isPublished,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update work');
      }

      router.push('/admin/works');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Work could not be updated.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <p className="text-sm text-neutral-500">
            Loading work...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="mb-2 text-sm text-neutral-500">
            Admin / Works / Edit
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Edit Work
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-800">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-800">
                  Slug
                </label>

                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Medium
                </label>

                <input
                  value={medium}
                  onChange={(event) => setMedium(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Year
                </label>

                <input
                  type="number"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Event name
                </label>

                <input
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Theme
                </label>

                <input
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Place
                </label>

                <input
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Material
                </label>

                <input
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">
                  Dimensions
                </label>

                <input
                  value={dimensions}
                  onChange={(event) => setDimensions(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-800">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  className={`${inputClass} min-h-48 resize-y`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) =>
                  setIsPublished(event.target.checked)
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Publish this work
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Uncheck to keep it as a draft.
                </p>
              </div>
            </label>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/works')}
              className="min-h-12 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}