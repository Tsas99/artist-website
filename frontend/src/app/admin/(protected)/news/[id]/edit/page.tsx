'use client';

import {
    use,
    useEffect,
    useState,
} from 'react';

import NewsEditForm from '@/components/admin/news/NewsEditForm';
import type { NewsItem } from '@/components/admin/news/types';
import { adminFetch } from '@/lib/admin-fetch';

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditNewsPage({
    params,
}: Props) {
    const { id } = use(params);

    const [news, setNews] =
        useState<NewsItem | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    useEffect(() => {
        async function loadNews() {
            try {
                const response =
                    await adminFetch(
                        `/api/admin/news/${id}`,
                    );

                if (
                    !response.ok
                ) {
                    throw new Error(
                        'Unable to load news.',
                    );
                }

                const data =
                    (await response.json()) as NewsItem;

                setNews(data);
            } catch (error) {
                console.error(
                    error,
                );

                setError(
                    'Unable to load news.',
                );
            } finally {
                setLoading(
                    false,
                );
            }
        }

        void loadNews();
    }, [id]);

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-6xl px-6 py-10">
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            </main>
        );
    }

    if (
        error ||
        !news
    ) {
        return (
            <main className="mx-auto w-full max-w-6xl px-6 py-10">
                <p className="text-sm text-red-600">
                    {error ||
                        'News not found.'}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
            <h1 className="mb-10 text-xl font-medium">
                Edit News
            </h1>

            <NewsEditForm
                news={news}
            />
        </main>
    );
}