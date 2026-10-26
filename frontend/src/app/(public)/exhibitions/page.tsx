
import Link from 'next/link';

type Exhibition = {
    id: number;
    name: string;
    slug: string;
    coverUrl: string | null;
    venue: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isPublished: boolean;
};

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

async function getExhibitions(): Promise<Exhibition[]> {
    const response = await fetch(`${API_URL}/exhibitions`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch exhibitions');
    }

    const exhibitions: Exhibition[] = await response.json();

    return exhibitions
        .filter((exhibition) => exhibition.isPublished)
        .sort((a, b) => {
            const dateA = a.startDate
                ? new Date(a.startDate).getTime()
                : 0;

            const dateB = b.startDate
                ? new Date(b.startDate).getTime()
                : 0;

            return dateB - dateA;
        });
}

function formatDateRange(
    startDate: string | null,
    endDate: string | null,
): string {
    if (!startDate && !endDate) return '';

    const format = (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        });

    if (!startDate) return format(endDate!);
    if (!endDate) return format(startDate);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const sameYear =
        start.getUTCFullYear() === end.getUTCFullYear();

    const sameMonth =
        sameYear &&
        start.getUTCMonth() === end.getUTCMonth();

    if (start.getTime() === end.getTime()) {
        return format(startDate);
    }

    if (sameMonth) {
        const month = start.toLocaleDateString('en-US', {
            month: 'long',
            timeZone: 'UTC',
        });

        return `${month} ${start.getUTCDate()}–${end.getUTCDate()}, ${start.getUTCFullYear()}`;
    }

    if (sameYear) {
        const startText = start.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
        });

        return `${startText} – ${format(endDate)}`;
    }

    return `${format(startDate)} – ${format(endDate)}`;
}

export default async function ExhibitionsPage() {
    const exhibitions = await getExhibitions();


    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {exhibitions.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                        No published exhibitions yet.
                    </p>
                ) : (
                    <div className="flex flex-col">
                        {exhibitions.map((exhibition, index) => {
                            const dateRange = formatDateRange(
                                exhibition.startDate,
                                exhibition.endDate,
                            );

                            return (
                                <article
                                    key={exhibition.id}
                                    className={`pb-16 sm:pb-20 ${index === 0 ? '' : 'pt-4'
                                        }`}
                                >
                                    <Link
                                        href={`/exhibitions/${exhibition.slug}`}
                                        className="group flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10"
                                    >
                                        {/* Exhibition cover */}
                                        <div className="flex w-full min-w-0 items-center justify-center lg:w-1/2 lg:shrink-0">
                                            {exhibition.coverUrl ? (
                                                <img
                                                    src={exhibition.coverUrl}
                                                    alt={exhibition.name}
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                    className="
        block
        h-auto
        w-auto
        max-w-[90%]
        max-h-[350px]
        object-contain
        sm:max-w-[380px]
        sm:max-h-[400px]
        lg:max-w-[450px]
        lg:max-h-[450px]
      "
                                                />
                                            ) : (
                                                <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-100">
                                                    <p className="text-xs text-neutral-400">
                                                        No cover image
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Exhibition information */}
                                        <div className="w-[90%] min-w-0 self-center lg:w-full lg:flex-1 lg:self-auto">
                                            <h2 className="font-display text-xl leading-snug text-neutral-950 sm:text-2xl ">
                                                {exhibition.name}
                                            </h2>

                                            {exhibition.venue && (
                                                <p className="mt-3 text-sm text-neutral-800">
                                                    {exhibition.venue}
                                                </p>
                                            )}

                                            {exhibition.location && (
                                                <p className="mt-1 text-xs text-neutral-800 sm:text-sm">
                                                    {exhibition.location}
                                                </p>
                                            )}

                                            {dateRange && (
                                                <p className="mt-3 text-xs text-neutral-800 sm:text-sm">
                                                    {dateRange}
                                                </p>
                                            )}

                                            <span className="mt-5 inline-flex border-b border-neutral-300 pb-1 text-[11px] font-medium tracking-[0.1em] text-neutral-500 transition-colors duration-300 group-hover:border-neutral-950 group-hover:text-neutral-950">
                                                View more
                                            </span>
                                        </div>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );

}
