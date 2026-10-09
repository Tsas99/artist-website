
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

export type AdminExhibitionListItem = {
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

type Props = {
    initialExhibitions: AdminExhibitionListItem[];
};

export default function ExhibitionOrderList({
    initialExhibitions,
}: Props) {
    const [exhibitions, setExhibitions] =
        useState(initialExhibitions);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    async function moveExhibition(
        index: number,
        direction: -1 | 1,
    ) {
        const targetIndex = index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= exhibitions.length ||
            saving
        ) {
            return;
        }

        const previous = [...exhibitions];
        const next = [...exhibitions];

        [next[index], next[targetIndex]] = [
            next[targetIndex],
            next[index],
        ];

        setExhibitions(next);
        setSaving(true);

        try {
            const response = await adminFetch(
                '/api/admin/exhibitions/reorder',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ids: next.map((item) => item.id),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to reorder exhibitions.');
            }
        } catch (error) {
            console.error(error);
            setExhibitions(previous);
            alert('Failed to change exhibition order.');
        } finally {
            setSaving(false);
        }
    }

    async function deleteExhibition(
        exhibition: AdminExhibitionListItem,
    ) {
        const confirmed = window.confirm(
            `Delete "${exhibition.name}" and its uploaded media? This cannot be undone.`,
        );

        if (!confirmed) return;

        setDeletingId(exhibition.id);

        try {
            const response = await adminFetch(
                `/api/admin/exhibitions/${exhibition.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                throw new Error('Failed to delete exhibition.');
            }

            setExhibitions((current) =>
                current.filter(
                    (item) => item.id !== exhibition.id,
                ),
            );
        } catch (error) {
            console.error(error);
            alert('Exhibition could not be deleted.');
        } finally {
            setDeletingId(null);
        }
    }

    function formatDate(value: string | null) {
        if (!value) return '';

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? ''
            : date.getUTCFullYear().toString();
    }

    return (
        <div className="space-y-3">
            {exhibitions.map((exhibition, index) => (
                <article
                    key={exhibition.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex shrink-0 items-center gap-1 sm:flex-col">
                            <button
                                type="button"
                                onClick={() =>
                                    moveExhibition(index, -1)
                                }
                                disabled={index === 0 || saving || deletingId !== null}
                                aria-label={`Move ${exhibition.name} up`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 disabled:opacity-30"
                            >
                                ↑
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    moveExhibition(index, 1)
                                }
                                disabled={
                                    index === exhibitions.length - 1 ||
                                    saving ||
                                    deletingId !== null
                                }
                                aria-label={`Move ${exhibition.name} down`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 disabled:opacity-30"
                            >
                                ↓
                            </button>
                        </div>

                        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-32">
                            {exhibition.coverUrl ? (
                                <img
                                    src={exhibition.coverUrl}
                                    alt={`${exhibition.name} poster`}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                    No poster
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-medium text-neutral-950 sm:text-lg">
                                    {exhibition.name}
                                </h2>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${exhibition.isPublished
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-neutral-100 text-neutral-500'
                                        }`}
                                >
                                    {exhibition.isPublished
                                        ? 'Published'
                                        : 'Draft'}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                                {exhibition.startDate && (
                                    <span>
                                        {formatDate(exhibition.startDate)}
                                    </span>
                                )}

                                {exhibition.venue && (
                                    <span>{exhibition.venue}</span>
                                )}

                                {exhibition.location && (
                                    <span>{exhibition.location}</span>
                                )}

                                <span className="truncate">
                                    /exhibitions/{exhibition.slug}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                            <Link
                                href={`/admin/exhibitions/${exhibition.id}`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium leading-none text-neutral-700 transition hover:bg-neutral-50"
                            >
                                View
                            </Link>

                            <Link
                                href={`/admin/exhibitions/${exhibition.id}/edit`}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium leading-none text-neutral-900 transition hover:bg-neutral-50"
                            >
                                Edit
                            </Link>


                            <button
                                type="button"
                                onClick={() =>
                                    deleteExhibition(exhibition)
                                }
                                disabled={deletingId !== null || saving}
                                className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                                {deletingId === exhibition.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
