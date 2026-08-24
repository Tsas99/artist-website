type Work = {
    id: number;
    title:string;
    slug: string;
    description:string | null;
    imageUrl: string | null;
    imageUrls: string[];
    place:string | null;
    material: string | null;
    dimensions: string | null;
    year: number | null;
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
        <main className="min-h-screen bg-white" >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <header className="mb-10 sm:mb-14">
                    <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500"></p>
                </header>

            </div>
        </main>
    )
}