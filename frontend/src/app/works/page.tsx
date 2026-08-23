type Work = {
    id: number;
    title:string;
    description:string | null;
    imageUrl: string | null;
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

  return response.json();
}

export default async function WorksPage() {
    const works = await getWorks();

    return (
        <main>
            <h1>Projects</h1>
            {works.length === 0 ? (
                <p>No works yet.</p>
            ):(
                works.map((work) => (
                    <article key={work.id}>
                        <h2>{work.title}</h2>
                        {work.year && <p>{work.year}</p>}
                        {work.description && <p>{work.description}</p>}
            
                    </article>
                ))
            )}
        </main>
    )
}