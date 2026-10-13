
import WorkCard from '@/components/WorkCard';

type Work = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  mediums: string[];
  isPublished: boolean;
};

async function getWorks(): Promise<Work[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/works`,
    { cache: 'no-store' },
  );

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
        {works.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No published works yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
