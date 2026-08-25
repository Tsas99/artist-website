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

async function getWork(slug: string): Promise<Work | null> {
  const response = await fetch('http://localhost:3001/works', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch work');
  }

  const works: Work[] = await response.json();

  return (
    works.find(
      (work) => work.slug === slug && work.isPublished,
    ) ?? null
  );
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm text-neutral-500">
            Work not found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-10 max-w-4xl sm:mb-14">
          <h1 className="text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
            {work.title}
          </h1>

          {(work.year || work.mediums.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500">
              {work.year && <span>{work.year}</span>}

              {work.mediums.length > 0 && (
                <span>{work.mediums.join(', ')}</span>
              )}
            </div>
          )}
        </header>

        {work.imageUrl && (
          <div className="mb-12 overflow-hidden bg-neutral-100 sm:mb-16">
            <img
              src={work.imageUrl}
              alt={work.title}
              className="h-auto w-full object-contain"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 border-t border-neutral-200 pt-10 lg:grid-cols-[280px_1fr] lg:gap-16">
          <aside className="space-y-6 text-sm">
            {work.eventName && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Event
                </p>
                <p className="mt-1 text-neutral-900">
                  {work.eventName}
                </p>
              </div>
            )}

            {work.theme && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Theme
                </p>
                <p className="mt-1 text-neutral-900">
                  {work.theme}
                </p>
              </div>
            )}

            {work.place && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Place
                </p>
                <p className="mt-1 text-neutral-900">
                  {work.place}
                </p>
              </div>
            )}

            {work.material && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Material
                </p>
                <p className="mt-1 text-neutral-900">
                  {work.material}
                </p>
              </div>
            )}

            {work.dimensions && (
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-400">
                  Dimensions
                </p>
                <p className="mt-1 text-neutral-900">
                  {work.dimensions}
                </p>
              </div>
            )}
          </aside>

          <section>
            {work.description && (
              <div className="max-w-3xl">
                <p className="whitespace-pre-line text-base leading-8 text-neutral-700 sm:text-lg">
                  {work.description}
                </p>
              </div>
            )}
          </section>
        </div>

        {work.imageUrls.length > 0 && (
          <section className="mt-14 border-t border-neutral-200 pt-10 sm:mt-20 sm:pt-14">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {work.imageUrls
                .filter((url) => url !== work.imageUrl)
                .map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={url}
                      alt={`${work.title} detail ${index + 1}`}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}