
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';

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
    venue: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    curatorialText: string | null;
    coverUrl: string | null;
    isPublished: boolean;
    media: ExhibitionMedia[];
};

function formatDate(value: string | null) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function Meta({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                {label}
            </p>
            <p className="text-sm leading-6 text-neutral-950">
                {value}
            </p>
        </div>
    );
}

export default function AdminExhibitionViewPage() {
    const params = useParams();
    const id = String(params.id);

    const [exhibition, setExhibition] =
        useState<Exhibition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadExhibition() {
            setIsLoading(true);
            setError('');

            try {
                const response = await adminFetch(
                    `/api/admin/exhibitions/${id}`,
                );

                if (!response.ok) {
                    throw new Error(
                        'Failed to load exhibition.',
                    );
                }

                const data: Exhibition =
                    await response.json();

                if (!cancelled) {
                    setExhibition(data);
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError('Exhibition could not be loaded.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadExhibition();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-sm text-neutral-500">
                        Loading exhibition...
                    </p>
                </div>
            </main>
        );
    }

    if (!exhibition) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/admin/exhibitions"
                        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-950"
                    >
                        ← Back to exhibitions
                    </Link>

                    <p className="text-sm text-red-600">
                        {error || 'Exhibition not found.'}
                    </p>
                </div>
            </main>
        );
    }

    const media = [...(exhibition.media ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );

    const dates = [
        formatDate(exhibition.startDate),
        formatDate(exhibition.endDate),
    ].filter(Boolean).join(' – ');

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <Link
                    href="/admin/exhibitions"
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
                >
                    ← Back to exhibitions
                </Link>

                <header className="mb-10 mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                                {exhibition.name}
                            </h1>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${exhibition.isPublished
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-neutral-200 text-neutral-600'
                                    }`}
                            >
                                {exhibition.isPublished
                                    ? 'Published'
                                    : 'Draft'}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-neutral-500">
                            /exhibitions/{exhibition.slug}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {exhibition.isPublished && (
                            <Link
                                href={`/exhibitions/${exhibition.slug}`}
                                target="_blank"
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                            >
                                View public ↗
                            </Link>
                        )}

                        <Link
                            href={`/admin/exhibitions/${exhibition.id}/edit`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Edit
                        </Link>
                    </div>
                </header>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.5fr)] lg:gap-12">
                    <div>
                        {exhibition.coverUrl ? (
                            <img
                                src={exhibition.coverUrl}
                                alt={`${exhibition.name} poster`}
                                className="h-auto w-full object-contain"
                            />
                        ) : (
                            <div className="flex min-h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-400">
                                No exhibition poster
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {dates && (
                            <Meta label="Dates" value={dates} />
                        )}

                        {exhibition.venue && (
                            <Meta
                                label="Venue"
                                value={exhibition.venue}
                            />
                        )}

                        {exhibition.location && (
                            <Meta
                                label="Location"
                                value={exhibition.location}
                            />
                        )}
                    </div>
                </section>

                {exhibition.curatorialText && (
                    <section className="mt-12 max-w-3xl">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-neutral-500">
                            Curatorial Text
                        </p>

                        <p className="whitespace-pre-line text-sm leading-7 text-neutral-950">
                            {exhibition.curatorialText}
                        </p>
                    </section>
                )}

                {media.length > 0 && (
                    <section className="mt-14">
                        <p className="mb-6 text-xs uppercase tracking-[0.14em] text-neutral-500">
                            Exhibition Documentation
                        </p>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {media.map((item) => (
                                <div key={item.id}>
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="h-auto w-full"
                                        />
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={`${exhibition.name} documentation`}
                                            loading="lazy"
                                            className="h-auto w-full"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
