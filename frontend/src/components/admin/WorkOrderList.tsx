'use client';

import Link from 'next/link';
import { useState } from 'react';
import DeleteWork from '@/components/admin/DeleteWork';
import { adminFetch } from '@/lib/admin-fetch';

export type AdminWorkListItem = {
    id: number;
    title: string;
    slug: string;
    imageUrl: string | null;
    year: string | null;
    isPublished: boolean;
};

type Props = {
    initialWorks: AdminWorkListItem[];
};

export default function WorksOrderList({
    initialWorks,
}: Props) {
    const [works, setWorks] = useState(initialWorks);
    const [saving, setSaving] = useState(false);

    async function moveWork(
        index: number,
        direction: -1 | 1,
    ) {
        const targetIndex = index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= works.length ||
            saving
        ) {
            return;
        }

        const previousWorks = [...works];
        const nextWorks = [...works];

        [nextWorks[index], nextWorks[targetIndex]] = [
            nextWorks[targetIndex],
            nextWorks[index],
        ];

        // UI-г шууд шинэчилнэ
        setWorks(nextWorks);
        setSaving(true);

        try {
            const response = await adminFetch(
                '/api/admin/works/reorder',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ids: nextWorks.map((work) => work.id),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to reorder projects.',
                );
            }
        } catch (error) {
            console.error(error);

            // Backend update бүтэлгүйтвэл хуучин байрлалд буцаана
            setWorks(previousWorks);
            alert('Failed to change project order.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-3">
            {works.map((work, index) => (
                <article
                    key={work.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* ORDER */}
                        <div className="flex shrink-0 items-center gap-1 sm:flex-col">
                            <button
                                type="button"
                                onClick={() => moveWork(index, -1)}
                                disabled={index === 0 || saving}
                                aria-label={`Move ${work.title} up`}
                                title="Move up"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-sm text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                ↑
                            </button>

                            <button
                                type="button"
                                onClick={() => moveWork(index, 1)}
                                disabled={
                                    index === works.length - 1 ||
                                    saving
                                }
                                aria-label={`Move ${work.title} down`}
                                title="Move down"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-sm text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                ↓
                            </button>
                        </div>

                        {/* IMAGE */}
                        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-32">
                            {work.imageUrl ? (
                                <img
                                    src={work.imageUrl}
                                    alt={work.title}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-medium text-neutral-950 sm:text-lg">
                                    {work.title}
                                </h2>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${work.isPublished
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-neutral-100 text-neutral-500'
                                        }`}
                                >
                                    {work.isPublished
                                        ? 'Published'
                                        : 'Draft'}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                                {work.year && (
                                    <span>{work.year}</span>
                                )}

                                <span className="truncate">
                                    /works/{work.slug}
                                </span>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Link
                                href={`/admin/works/${work.id}`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium leading-none text-neutral-700 transition hover:bg-neutral-50"
                            >
                                View
                            </Link>

                            <Link
                                href={`/admin/works/${work.id}/edit`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium leading-none text-neutral-900 transition hover:bg-neutral-50"
                            >
                                Edit
                            </Link>

                            <DeleteWork
                                workId={work.id}
                                title={work.title}
                            />
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}