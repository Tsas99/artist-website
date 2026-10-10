
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExhibitionGallery from '@/components/ExhibitionGallery';

type ExhibitionMedia = {
    id: number;
    url: string;
    publicId: string;
    type: string;
    sortOrder: number;
};

type Exhibition = {
    id: number;
    name: string;
    slug: string;
    curatorialText: string | null;
    coverUrl: string | null;
    venue: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isPublished: boolean;
    media: ExhibitionMedia[];
};

type PageProps = {
    params: Promise<{ slug: string }>;
};

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

async function getExhibition(
    slug: string,
): Promise<Exhibition | null> {
    const response = await fetch(
        `${API_URL}/exhibitions/slug/${encodeURIComponent(slug)}`,
        { cache: 'no-store' },
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to fetch exhibition');
    }

    const exhibition: Exhibition = await response.json();

    if (!exhibition.isPublished) {
        return null;
    }

    return exhibition;
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

    if (start.getTime() === end.getTime()) {
        return format(startDate);
    }

    const sameYear =
        start.getUTCFullYear() === end.getUTCFullYear();

    const sameMonth =
        sameYear &&
        start.getUTCMonth() === end.getUTCMonth();

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

export default async function ExhibitionDetailPage({
    params,
}: PageProps) {
    const { slug } = await params;
    const exhibition = await getExhibition(slug);

    if (!exhibition) {
        notFound();
    }

    const dateRange = formatDateRange(
        exhibition.startDate,
        exhibition.endDate,
    );

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">

                {/* Back navigation */}
                <Link
                    href="/exhibitions"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-neutral-950"
                >
                    <span aria-hidden="true">←</span>
                    Back to Exhibitions
                </Link>

                {/* Exhibition heading */}
                <header className="mt-12">
                    <h1 className="font-display text-3xl leading-tight text-neutral-950 sm:text-4xl">
                        {exhibition.name}
                    </h1>

                    <div className="mt-5 space-y-1 text-sm text-neutral-600">
                        {exhibition.venue && (
                            <p>{exhibition.venue}</p>
                        )}

                        {exhibition.location && (
                            <p>{exhibition.location}</p>
                        )}

                        {dateRange && (
                            <p>{dateRange}</p>
                        )}
                    </div>
                </header>


                {/* Cover, Curatorial Text and Gallery */}
                <div className="flex flex-col mt-8">

                    {/* Cover / Poster */}
                    {exhibition.coverUrl && (
                        <section>
                            <img
                                src={exhibition.coverUrl}
                                alt={`${exhibition.name} exhibition poster`}
                                className="block h-auto max-h-[480px] w-auto max-w-full object-contain"
                            />
                        </section>
                    )}

                    {/* Curatorial Text */}
                    {exhibition.curatorialText && (
                        <section
                            className="max-w-2xl"
                            style={{
                                marginTop: exhibition.coverUrl ? '48px' : '0px',
                            }}
                        >
                            <div className="whitespace-pre-line text-sm leading-7 text-neutral-700 sm:text-base sm:leading-8">
                                {exhibition.curatorialText}
                            </div>
                        </section>
                    )}

                    {/* Exhibition Gallery */}
                    {exhibition.media?.length > 0 && (
                        <section
                            style={{
                                marginTop: exhibition.curatorialText ? '56px' : '48px',
                            }}
                        >
                            <ExhibitionGallery
                                media={exhibition.media}
                                exhibitionName={exhibition.name}
                            />
                        </section>
                    )}

                </div>

                {/* Footer navigation */}
                <div className="mt-20 border-t border-neutral-200 pt-8">
                    <Link
                        href="/exhibitions"
                        className="text-xs uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-neutral-950"
                    >
                        ← Back to Exhibitions
                    </Link>
                </div>
            </div>
        </main>
    );
}
