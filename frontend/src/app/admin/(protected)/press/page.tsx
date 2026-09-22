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
    coverUrl: string | null;
    coverPublicId: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
};

export default function AdminPressPage() {
    const [entries, setEntries] =
        useState<PressEntry[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState('');

    const [message, setMessage] =
        useState('');

    async function loadEntries() {
        try {
            setError('');

            const response =
                await adminFetch(
                    '/api/admin/press',
                );

            if (!response.ok) {
                throw new Error(
                    'Failed to load press entries.',
                );
            }

            const text =
                await response.text();

            if (!text) {
                setEntries([]);
                return;
            }

            const data =
                JSON.parse(text);

            setEntries(
                Array.isArray(data)
                    ? data
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
        loadEntries();
    }, []);

    async function handleDelete(
        entry: PressEntry,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${entry.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(entry.id);
        setError('');
        setMessage('');

        try {
            const response =
                await adminFetch(
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

    return (
        <main className="mx-auto max-w-6xl p-6 sm:p-8">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                        Press
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Manage catalogues,
                        interviews, articles
                        and curatorial texts.
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
                    {entries.map(
                        (entry) => (
                            <article
                                key={entry.id}
                                className="grid gap-5 border-b border-neutral-200 py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-start"
                            >
                                <div>
                                    {entry.coverUrl ? (
                                        <img
                                            src={
                                                entry.coverUrl
                                            }
                                            alt=""
                                            className="h-auto w-full"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                                            No cover
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-sm font-medium text-neutral-950">
                                            {
                                                entry.name
                                            }
                                        </h2>

                                        <span
                                            className={
                                                entry.isPublished
                                                    ? 'text-xs text-neutral-500'
                                                    : 'text-xs text-amber-600'
                                            }
                                        >
                                            {entry.isPublished
                                                ? 'Published'
                                                : 'Draft'}
                                        </span>
                                    </div>

                                    {entry.details && (
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-500">
                                            {
                                                entry.details
                                            }
                                        </p>
                                    )}

                                    {entry.link && (
                                        <p className="mt-2 truncate text-xs text-neutral-400">
                                            {
                                                entry.link
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4 sm:justify-end">
                                    <Link
                                        href={`/admin/press/${entry.id}/edit`}
                                        className="text-sm text-neutral-600 transition hover:text-neutral-950"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        disabled={
                                            deletingId ===
                                            entry.id
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                entry,
                                            )
                                        }
                                        className="text-sm text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingId ===
                                            entry.id
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </button>
                                </div>
                            </article>
                        ),
                    )}
                </div>
            )}
        </main>
    );
}