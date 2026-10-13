import WorkGallery from '@/components/works/WorkGallerey';
import { API_URL } from '@/lib/api';
import Image from 'next/image';
type WorkMedia = {
  id: number;
  url: string;
  publicId: string;
  type: 'image' | 'video';
  sortOrder: number;
  workId: number;

};

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
  year: string | null;

  isPublished: boolean;

  media: WorkMedia[];
  links: WorkLink[];
};

type WorkLink = {
  id: number;
  label: string;
  url: string;
  sortOrder: number;
  workId: number;
};



async function getWork(
  slug: string,
): Promise<Work | null> {
  const response = await fetch(
    `${API_URL}/works/slug/${encodeURIComponent(slug)}`,
    {
      cache: 'no-store',
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch work');
  }

  const work: Work = await response.json();

  if (!work || !work.isPublished) {
    return null;
  }

  return work;
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

  const galleryMedia = work.media.filter(
    (item) =>
      !(
        item.type === 'image' &&
        item.url === work.imageUrl
      ),
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl  px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* <header className="mb-10 max-w-4xl sm:mb-14">
          <h1 className="text-4xl font-medium tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            {work.title}
          </h1>

          {work.mediums.length > 0 && (
            <div className="mt-4 text-bold text-neutral-950">
              <span>{work.mediums.join(', ')}</span>
            </div>
          )}
        </header> */}

        {work.imageUrl && (
          <div className="mb-12 overflow-hidden sm:mb-16">
            <img
              src={work.imageUrl}
              alt={work.title}
              className="h-auto w-full object-contain"
            />
          </div>
        )}
        <h1 className="text-4xl font-medium font-display tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
          {work.title}
        </h1>


        <div className="grid grid-cols-1 gap-10 border-t border-neutral-200 pt-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-16">

          <aside className="space-y-6 text-sm">
            {work.mediums.length > 0 && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Medium
                </span>
                <span className="text-neutral-900">
                  {work.mediums.join(', ')}
                </span>
              </div>
            )}

            {work.eventName && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Event
                </span>
                <span className="text-neutral-900">
                  {work.eventName}
                </span>
              </div>
            )}

            {work.theme && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Theme
                </span>
                <span className="text-neutral-900">
                  {work.theme}
                </span>
              </div>
            )}

            {work.year && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Date
                </span>
                <span className="text-neutral-900">
                  {work.year}
                </span>
              </div>
            )}

            {work.place && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Place
                </span>
                <span className="min-w-0 break-words text-neutral-900">
                  {work.place}
                </span>
              </div>
            )}

            {work.material && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Material
                </span>
                <span className="min-w-0 break-words text-neutral-900">
                  {work.material}
                </span>
              </div>
            )}

            {work.dimensions && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Dimensions
                </span>
                <span className="min-w-0 break-words text-neutral-900">
                  {work.dimensions}
                </span>
              </div>
            )}

            {work.links?.length > 0 && (
              <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-4">
                <span className="text-xs uppercase tracking-wider text-neutral-400">
                  Links
                </span>

                <div className="min-w-0 space-y-2">
                  {[...work.links]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-fit max-w-full break-words text-sm text-neutral-900 underline underline-offset-4 transition hover:text-neutral-500"
                      >
                        {link.label}
                      </a>
                    ))}
                </div>
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

        <WorkGallery
          media={galleryMedia}
          workTitle={work.title} />
      </div>
    </main>
  );
}