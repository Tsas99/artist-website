
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

type PressEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    link: string | null;
    linkTitle: string | null;
    coverUrl: string | null;
    coverPublicId: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
};

export default function AdminPressPage() {
    const [entries, setEntries] =
        useState<PressEntry[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [reordering, setReordering] =
        useState(false);

    const [error, setError] =
        useState('');

    const [message, setMessage] =
        useState('');

    async function loadEntries() {
        try {
            setError('');

            const response = await adminFetch(
                '/api/admin/press',
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to load press entries.',
                );
            }

            const text = await response.text();

            if (!text) {
                setEntries([]);
                return;
            }

            const data = JSON.parse(text);

            setEntries(
                Array.isArray(data)
                    ? [...data].sort(
                        (a: PressEntry, b: PressEntry) =>
                            (a.sortOrder ?? 0) -
                            (b.sortOrder ?? 0) ||
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime() ||
                            b.id - a.id,
                    )
                    : [],
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadEntries();
    }, []);

    async function moveEntry(
        index: number,
        direction: -1 | 1,
    ) {
        if (reordering || deletingId !== null) {
            return;
        }

        const targetIndex = index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= entries.length
        ) {
            return;
        }

        const previousEntries = [...entries];
        const reordered = [...entries];

        [
            reordered[index],
            reordered[targetIndex],
        ] = [
                reordered[targetIndex],
                reordered[index],
            ];

        setEntries(reordered);
        setReordering(true);
        setError('');
        setMessage('');

        try {
            const response = await adminFetch(
                '/api/admin/press/reorder',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ids: reordered.map(
                            (entry) => entry.id,
                        ),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to save press order.',
                );
            }

            setMessage('Press order saved.');

            await loadEntries();
        } catch (err) {
            setEntries(previousEntries);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to reorder press.',
            );
        } finally {
            setReordering(false);
        }
    }

    async function handleDelete(
        entry: PressEntry,
    ) {
        if (reordering || deletingId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${entry.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(entry.id);
        setError('');
        setMessage('');

        try {
            const response = await adminFetch(
                `/api/admin/press/${entry.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to delete press entry.',
                );
            }

            setMessage(
                'Press entry deleted successfully.',
            );

            await loadEntries();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    function getExternalUrl(
        value: string | null,
    ) {
        if (!value?.trim()) {
            return null;
        }

        try {
            const url = new URL(value.trim());

            if (
                url.protocol !== 'http:' &&
                url.protocol !== 'https:'
            ) {
                return null;
            }

            return url.toString();
        } catch {
            return null;
        }
    }

    return (
        <main className="mx-auto max-w-6xl p-6 sm:p-8">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                        Press
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Manage catalogues, interviews,
                        articles and curatorial texts.
                    </p>
                </div>

                <Link
                    href="/admin/press/new"
                    className="inline-flex w-fit items-center bg-neutral-950 px-5 py-3 text-sm text-white transition hover:bg-neutral-800"
                >
                    New Press
                </Link>
            </div>

            {error && (
                <p className="mb-6 text-sm text-red-600">
                    {error}
                </p>
            )}

            {message && (
                <p className="mb-6 text-sm text-neutral-600">
                    {message}
                </p>
            )}

            {loading ? (
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            ) : entries.length === 0 ? (
                <div className="border-t border-neutral-200 py-12">
                    <p className="text-sm text-neutral-500">
                        No press entries yet.
                    </p>
                </div>
            ) : (
                <div className="border-t border-neutral-200">
                    {entries.map((entry, index) => {
                        const externalUrl =
                            getExternalUrl(entry.link);

                        return (
                            <article
                                key={entry.id}
                                className="grid gap-5 border-b border-neutral-200 py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto_auto] sm:items-start"
                            >
                                {/* COVER IMAGE */}
                                <div>
                                    {entry.coverUrl ? (
                                        <img
                                            src={entry.coverUrl}
                                            alt=""
                                            className="h-auto w-full"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                                            No cover
                                        </div>
                                    )}
                                </div>

                                {/* PRESS INFORMATION */}
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-sm font-medium text-neutral-950">
                                            {entry.name}
                                        </h2>

                                        <span
                                            className={
                                                entry.isPublished
                                                    ? 'text-xs font-medium bg-green-50 rounded-full px-2.5 py-1 text-xs text-emerald-600'
                                                    : 'text-xs text-amber-600'
                                            }
                                        >
                                            {entry.isPublished
                                                ? 'Published'
                                                : 'Draft'}
                                        </span>
                                    </div>

                                    {entry.details && (
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-950">
                                            {entry.details}
                                        </p>
                                    )}

                                    {/* LINK TITLE */}
                                    {entry.link && (
                                        <div className="mt-3">
                                            {externalUrl ? (
                                                <a
                                                    href={externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-neutral-700 underline underline-offset-4 transition hover:text-neutral-950"
                                                >
                                                    {entry.linkTitle?.trim() ||
                                                        'Open Link'}

                                                </a>
                                            ) : (
                                                <span className="text-sm text-neutral-500">
                                                    {entry.linkTitle?.trim() ||
                                                        'Invalid Link'}
                                                </span>
                                            )}

                                            <p className="mt-1 max-w-xl truncate text-xs text-neutral-400">
                                                {entry.link}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* ORDER BUTTONS */}
                                <div className="flex items-center gap-1 sm:justify-end">
                                    <button
                                        type="button"
                                        aria-label={`Move ${entry.name} up`}
                                        title="Move up"
                                        disabled={
                                            index === 0 ||
                                            reordering ||
                                            deletingId !== null
                                        }
                                        onClick={() =>
                                            moveEntry(index, -1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        ↑
                                    </button>

                                    <button
                                        type="button"
                                        aria-label={`Move ${entry.name} down`}
                                        title="Move down"
                                        disabled={
                                            index === entries.length - 1 ||
                                            reordering ||
                                            deletingId !== null
                                        }
                                        onClick={() =>
                                            moveEntry(index, 1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                </div>

                                {/* EDIT / DELETE */}
                                <div className="flex items-center gap-4 sm:justify-end">
                                    <Link
                                        href={`/admin/press/${entry.id}/edit`}
                                        className="text-sm text-neutral-600 transition hover:text-neutral-950"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={
                                            deletingId !== null ||
                                            reordering
                                        }
                                        onClick={() =>
                                            handleDelete(entry)
                                        }
                                        className="text-sm text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingId === entry.id
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
