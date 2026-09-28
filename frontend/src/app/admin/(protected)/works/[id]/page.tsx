'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { API_URL } from '@/lib/api';

type WorkMedia = {
    id: number;
    url: string;
    publicId: string;
    type: string;
    sortOrder: number;
};

type Work = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    mediums: string[];
    eventName: string | null;
    theme: string | null;
    place: string | null;
    material: string | null;
    dimensions: string | null;
    year: string | null;
    isPublished: boolean;
    media: WorkMedia[];
};

export default function AdminWorkViewPage() {
    const params = useParams();
    const id = params.id as string;

    const [work, setWork] = useState<Work | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        async function loadWork() {
            try {
                setIsLoading(true);
                setError('');

                const response = await fetch(
                    `${API_URL}/works/${id}`,
                );

                if (!response.ok) {
                    throw new Error('Failed to load work');
                }

                const data: Work = await response.json();

                setWork(data);
            } catch (error) {
                console.error(error);
                setError('Work could not be loaded.');
            } finally {
                setIsLoading(false);
            }
        }

        void loadWork();
    }, [id]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-sm text-neutral-500">
                        Loading work...
                    </p>
                </div>
            </main>
        );
    }

    if (!work) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/admin/works"
                        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-950"
                    >
                        ← Back to projects
                    </Link>

                    <p className="text-sm text-red-600">
                        {error || 'Work not found.'}
                    </p>
                </div>
            </main>
        );
    }

    const media = [...(work.media ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                {/* Back */}
                <Link
                    href="/admin/works"
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
                >
                    ← Back to projects
                </Link>

                {/* Header */}
                <header className="mt-5 mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                                {work.title}
                            </h1>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${work.isPublished
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-neutral-200 text-neutral-600'
                                    }`}
                            >
                                {work.isPublished
                                    ? 'Published'
                                    : 'Draft'}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-neutral-500">
                            /works/{work.slug}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {work.isPublished && (
                            <Link
                                href={`/works/${work.slug}`}
                                target="_blank"
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                            >
                                View public ↗
                            </Link>
                        )}

                        <Link
                            href={`/admin/works/${work.id}/edit`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Edit
                        </Link>
                    </div>
                </header>

                {/* Cover + metadata */}
                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.5fr)] lg:gap-12">
                    <div>
                        {work.imageUrl ? (
                            <img
                                src={work.imageUrl}
                                alt={work.title}
                                className="h-auto w-full"
                            />
                        ) : (
                            <div className="flex min-h-64 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm text-neutral-400">
                                No cover image
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {work.year !== null && (
                            <Meta
                                label="Year"
                                value={String(work.year)}
                            />
                        )}

                        {work.mediums?.length > 0 && (
                            <Meta
                                label="Medium"
                                value={work.mediums.join(', ')}
                            />
                        )}

                        {work.material && (
                            <Meta
                                label="Material"
                                value={work.material}
                            />
                        )}

                        {work.dimensions && (
                            <Meta
                                label="Dimensions"
                                value={work.dimensions}
                            />
                        )}

                        {work.place && (
                            <Meta
                                label="Place"
                                value={work.place}
                            />
                        )}

                        {work.eventName && (
                            <Meta
                                label="Event"
                                value={work.eventName}
                            />
                        )}

                        {work.theme && (
                            <Meta
                                label="Theme"
                                value={work.theme}
                            />
                        )}
                    </div>
                </section>

                {/* Description */}
                {work.description && (
                    <section className="mt-12 max-w-3xl">
                        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-neutral-500">
                            Description
                        </p>

                        <p className="whitespace-pre-line text-sm leading-7 text-neutral-950">
                            {work.description}
                        </p>
                    </section>
                )}

                {/* Gallery */}
                {media.length > 0 && (
                    <section className="mt-14">
                        <p className="mb-6 text-xs uppercase tracking-[0.14em] text-neutral-500">
                            Media
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
                                            alt=""
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