import Link from 'next/link';

type Work = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  year: number | null;
  isPublished: boolean;
};

async function getWorks(): Promise<Work[]> {
const response = await fetch('http://127.0.0.1:3001/works', {
  cache: 'no-store',
});

  if (!response.ok) {
    throw new Error('Failed to fetch works');
  }

  return response.json();
}

export default async function AdminWorksPage() {
  const works = await getWorks();

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-neutral-500">
              Admin / Projects
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Projects
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage published and draft artworks.
            </p>
          </div>

          <Link
            href="/admin/works/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add new work
          </Link>
        </header>

        {works.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-neutral-500">
              No works yet.
            </p>

            <Link
              href="/admin/works/new"
              className="mt-4 inline-block text-sm font-medium text-neutral-950 underline underline-offset-4"
            >
              Add your first work
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {works.map((work) => (
              <article
                key={work.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-32">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-medium text-neutral-950 sm:text-lg">
                        {work.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          work.isPublished
                            ? 'bg-green-50 text-green-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {work.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                      {work.year && <span>{work.year}</span>}

                      <span className="truncate">
                        /works/{work.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Link
                      href={`/works/${work.slug}`}
                      className="min-h-10 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      View
                    </Link>

                    <Link
                       href={`/admin/works/${work.id}`}
                      className="min-h-10 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                    >
                     Manage
                    </Link>

                    <button
                      type="button"
                      className="min-h-10 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}