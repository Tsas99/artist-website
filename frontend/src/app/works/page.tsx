import Link from 'next/link';

type Work = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  mediums: string[];
  isPublished: boolean;
};

async function getWorks(): Promise<Work[]> {
  const response = await fetch('http://localhost:3001/works', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch works');
  }

  const works: Work[] = await response.json();

  return works.filter((work) => work.isPublished);
}

export default async function WorksPage() {
  const works = await getWorks();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-10 sm:mb-14">
          <h1 className="text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            Projects
          </h1>
        </header>

        {works.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No published works yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <article key={work.id} className="group">
                <Link href={`/works/${work.slug}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h2 className="text-lg font-medium text-neutral-950">
                      {work.title}
                    </h2>

                    {work.mediums.length > 0 && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {work.mediums.join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}