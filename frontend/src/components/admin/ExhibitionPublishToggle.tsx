
'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

import type { Exhibition } from './ExhibitionInfoEditor';

type Props = {
    exhibition: Exhibition;
    onExhibitionChange: (exhibition: Exhibition) => void;
    onError: (message: string) => void;
};

export default function ExhibitionPublishToggle({
    exhibition,
    onExhibitionChange,
    onError,
}: Props) {
    const [isSaving, setIsSaving] = useState(false);

    async function handleToggle() {
        const nextPublished = !exhibition.isPublished;

        if (nextPublished && !exhibition.coverUrl) {
            onError(
                'Please upload an exhibition poster before publishing.',
            );
            return;
        }

        setIsSaving(true);
        onError('');

        try {
            const response = await adminFetch(
                `/api/admin/exhibitions/${exhibition.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        isPublished: nextPublished,
                    }),
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                const message = data?.message;

                throw new Error(
                    Array.isArray(message)
                        ? message.join(', ')
                        : typeof message === 'string'
                            ? message
                            : 'Failed to update publication status.',
                );
            }

            const updated: Exhibition = await response.json();

            onExhibitionChange(updated);
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update publication status.',
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <span
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${exhibition.isPublished
                        ? 'bg-green-50 text-green-700'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
            >
                {exhibition.isPublished ? 'Published' : 'Draft'}
            </span>

            <button
                type="button"
                onClick={handleToggle}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSaving
                    ? 'Saving...'
                    : exhibition.isPublished
                        ? 'Unpublish'
                        : 'Publish'}
            </button>
        </div>
    );
}
