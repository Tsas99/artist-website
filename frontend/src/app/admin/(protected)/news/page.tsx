'use client';

import Link from 'next/link';
import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { adminFetch } from '@/lib/admin-fetch';
import type { NewsItem } from '@/components/admin/news/types';

function getDomain(url: string) {
    try {
        return new URL(url)
            .hostname
            .replace(/^www\./, '');
    } catch {
        return url;
    }
}



export default function AdminNewsPage() {
    const [items, setItems] =
        useState<NewsItem[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const loadNews = useCallback(
        async () => {
            try {
                setError('');

                const response =
                    await adminFetch(
                        '/api/admin/news',
                    );

                if (!response.ok) {
                    throw new Error(
                        'Unable to load news.',
                    );
                }

                const data =
                    (await response.json()) as NewsItem[];

                setItems(data);
            } catch (error) {
                console.error(error);

                setError(
                    'Unable to load news.',
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        void loadNews();
    }, [loadNews]);

    async function handleDelete(
        item: NewsItem,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${item.title}"?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(item.id);
            setError('');

            const response =
                await adminFetch(
                    `/api/admin/news/${item.id}`,
                    {
                        method: 'DELETE',
                    },
                );

            if (!response.ok) {
                throw new Error(
                    'Unable to delete news.',
                );
            }

            setItems((current) =>
                current.filter(
                    (news) =>
                        news.id !== item.id,
                ),
            );
        } catch (error) {
            console.error(error);

            setError(
                'Unable to delete news.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <div className="mb-10 flex items-center justify-between gap-6">
                <h1 className="text-xl font-medium">
                    News
                </h1>

                <Link
                    href="/admin/news/new"
                    className="bg-neutral-950 px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-75"
                >
                    Add News
                </Link>
            </div>

            {error && (
                <p className="mb-6 text-sm text-red-600">
                    {error}
                </p>
            )}

            {loading ? (
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            ) : items.length === 0 ? (
                <p className="text-sm text-neutral-500">
                    No news yet.
                </p>
            ) : (
                <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-5 py-5"
                        >
                            <div className="flex h-[80px] w-[60px] items-center justify-center overflow-hidden bg-neutral-50">
                                {item.posterUrl ? (
                                    <img
                                        src={
                                            item.posterUrl
                                        }
                                        alt=""
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-[10px] text-neutral-400">
                                        No poster
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0">
                                {/* Title + status */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <p className="truncate text-sm font-medium text-neutral-950">
                                        {item.title}
                                    </p>

                                    <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                                        {item.isPublished
                                            ? 'Published'
                                            : 'Draft'}
                                    </span>
                                </div>

                                {/* Category */}
                                {item.category && (
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                                        {item.category}
                                    </p>
                                )}

                                {/* Date + location */}
                                {(item.date ||
                                    item.location) && (
                                        <p className="mt-1 text-xs text-neutral-500">
                                            {[
                                                item.date,
                                                item.location,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    )}

                                {/* Description */}
                                {item.description && (
                                    <p className="mt-2 max-w-2xl line-clamp-2 text-xs leading-5 text-neutral-500">
                                        {item.description}
                                    </p>
                                )}

                                {/* External link */}
                                {item.externalLink && (
                                    <a
                                        href={item.externalLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block text-xs text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950"
                                    >
                                        {getDomain(item.externalLink)}
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/admin/news/${item.id}/edit`}
                                    className="text-xs text-neutral-500 transition-colors hover:text-neutral-950"
                                >
                                    Edit
                                </Link>

                                <button
                                    type="button"
                                    disabled={
                                        deletingId ===
                                        item.id
                                    }
                                    onClick={() =>
                                        handleDelete(item)
                                    }
                                    className="text-xs text-neutral-500 transition-colors hover:text-red-600 disabled:opacity-40"
                                >
                                    {deletingId ===
                                        item.id
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}