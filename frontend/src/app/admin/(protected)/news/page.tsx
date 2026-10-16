
'use client';

import Link from 'next/link';
import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { adminFetch } from '@/lib/admin-fetch';
import type { NewsItem } from '@/components/admin/news/types';

type SortableNewsItem = NewsItem & {
    sortOrder?: number;
    createdAt?: string;
};

function getDomain(url: string) {
    try {
        return new URL(url)
            .hostname
            .replace(/^www\./, '');
    } catch {
        return url;
    }
}

function getExternalUrl(value: string) {
    try {
        const url = new URL(value);

        if (
            url.protocol !== 'https:' &&
            url.protocol !== 'http:'
        ) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}

function sortNews(data: SortableNewsItem[]) {
    return [...data].sort((a, b) => {
        const orderDifference =
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        const dateDifference =
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime();

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return b.id - a.id;
    });
}

export default function AdminNewsPage() {
    const [items, setItems] =
        useState<SortableNewsItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [reordering, setReordering] =
        useState(false);

    const loadNews = useCallback(async () => {
        const response = await adminFetch(
            '/api/admin/news',
        );

        if (!response.ok) {
            throw new Error('Unable to load news.');
        }

        const data: SortableNewsItem[] =
            await response.json();

        setItems(
            Array.isArray(data) ? sortNews(data) : [],
        );
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function initialLoad() {
            try {
                await loadNews();
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError('Unable to load news.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void initialLoad();

        return () => {
            cancelled = true;
        };
    }, [loadNews]);

    // MOVE NEWS UP OR DOWN
    async function moveNews(
        index: number,
        direction: -1 | 1,
    ) {
        if (reordering || deletingId !== null) {
            return;
        }

        const targetIndex = index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= items.length
        ) {
            return;
        }

        const previousItems = [...items];
        const reordered = [...items];

        [reordered[index], reordered[targetIndex]] = [
            reordered[targetIndex],
            reordered[index],
        ];

        setItems(reordered);
        setReordering(true);
        setError('');
        setMessage('');

        try {
            const response = await adminFetch(
                '/api/admin/news/reorder',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ids: reordered.map((item) => item.id),
                    }),
                },
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => null);

                const detail = data?.message;

                throw new Error(
                    Array.isArray(detail)
                        ? detail.join(', ')
                        : typeof detail === 'string'
                            ? detail
                            : 'Unable to save news order.',
                );
            }

            const updated: SortableNewsItem[] =
                await response.json();

            if (Array.isArray(updated)) {
                setItems(sortNews(updated));
            } else {
                await loadNews();
            }

            setMessage('News order saved.');
        } catch (err) {
            console.error(err);
            setItems(previousItems);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to save news order.',
            );
        } finally {
            setReordering(false);
        }
    }

    // DELETE NEWS
    async function handleDelete(item: NewsItem) {
        if (reordering || deletingId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${item.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(item.id);
            setError('');
            setMessage('');

            const response = await adminFetch(
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
                    (news) => news.id !== item.id,
                ),
            );

            setMessage(
                'News deleted successfully.',
            );
        } catch (err) {
            console.error(err);

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
                <p
                    role="alert"
                    className="mb-6 text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            {message && (
                <p
                    role="status"
                    className="mb-6 text-sm text-neutral-600"
                >
                    {message}
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
                    {items.map((item, index) => {
                        const externalUrl = item.externalLink
                            ? getExternalUrl(item.externalLink)
                            : null;

                        return (
                            <div
                                key={item.id}
                                className="grid grid-cols-[70px_minmax(0,1fr)] items-start gap-5 py-5 sm:grid-cols-[70px_minmax(0,1fr)_auto_auto] sm:items-center"
                            >
                                {/* POSTER */}
                                <div className="flex h-[80px] w-[60px] items-center justify-center overflow-hidden bg-neutral-50">
                                    {item.posterUrl ? (
                                        <img
                                            src={item.posterUrl}
                                            alt=""
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-[10px] text-neutral-400">
                                            No poster
                                        </span>
                                    )}
                                </div>

                                {/* NEWS INFORMATION */}
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className="truncate text-sm font-medium text-neutral-950">
                                            {item.title}
                                        </p>

                                        <span
                                            className={
                                                item.isPublished
                                                    ? 'text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600'
                                                    : 'text-[10px] uppercase tracking-[0.12em] text-amber-600'
                                            }
                                        >
                                            {item.isPublished
                                                ? 'Published'
                                                : 'Draft'}
                                        </span>
                                    </div>

                                    {/* CATEGORY */}
                                    {item.category && (
                                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-neutral-950">
                                            {item.category}
                                        </p>
                                    )}


                                    {/* DATE + VENUE + LOCATION */}
                                    {(item.date || item.venue || item.location) && (
                                        <div className="mt-2 space-y-1 text-xs text-neutral-950">
                                            {item.date && (
                                                <p>{item.date}</p>
                                            )}

                                            {item.venue && (
                                                <p>{item.venue}</p>
                                            )}

                                            {item.location && (
                                                <p>{item.location}</p>
                                            )}
                                        </div>
                                    )}


                                    {/* DESCRIPTION */}
                                    {item.description && (
                                        <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-neutral-950">
                                            {item.description}
                                        </p>
                                    )}

                                    {/* EXTERNAL LINK */}
                                    {externalUrl && (
                                        <a
                                            href={externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-xs text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950"
                                        >
                                            {getDomain(externalUrl)}
                                        </a>
                                    )}
                                </div>

                                {/* SORT BUTTONS */}
                                <div className="flex items-center gap-1 sm:justify-end">
                                    <button
                                        type="button"
                                        title="Move up"
                                        aria-label={`Move ${item.title} up`}
                                        disabled={
                                            index === 0 ||
                                            reordering ||
                                            deletingId !== null
                                        }
                                        onClick={() =>
                                            moveNews(index, -1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        ↑
                                    </button>

                                    <button
                                        type="button"
                                        title="Move down"
                                        aria-label={`Move ${item.title} down`}
                                        disabled={
                                            index === items.length - 1 ||
                                            reordering ||
                                            deletingId !== null
                                        }
                                        onClick={() =>
                                            moveNews(index, 1)
                                        }
                                        className="flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm text-neutral-700 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                </div>

                                {/* EDIT / DELETE */}
                                <div className="flex items-center gap-4 sm:justify-end">
                                    <Link
                                        href={`/admin/news/${item.id}/edit`}
                                        className="text-xs text-neutral-500 transition-colors hover:text-neutral-950"
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
                                            handleDelete(item)
                                        }
                                        className="text-xs text-neutral-500 transition-colors hover:text-red-600 disabled:opacity-40"
                                    >
                                        {deletingId === item.id
                                            ? 'Deleting...'
                                            : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
