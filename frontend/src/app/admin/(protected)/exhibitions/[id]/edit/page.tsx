
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import ExhibitionInfoEditor, {
    type Exhibition,
} from '@/components/admin/ExhibitionInfoEditor';

import ExhibitionMediaManager from '@/components/admin/ExhibitionMediaManager';
import ExhibitionPublishToggle from '@/components/admin/ExhibitionPublishToggle';
import { adminFetch } from '@/lib/admin-fetch';

export default function AdminExhibitionEditPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    const [exhibition, setExhibition] =
        useState<Exhibition | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        async function loadExhibition() {
            try {
                setIsLoading(true);
                setError('');

                const response = await adminFetch(
                    `/api/admin/exhibitions/${id}`,
                );

                if (!response.ok) {
                    throw new Error('Failed to load exhibition');
                }

                const data: Exhibition = await response.json();

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
                <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
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
                <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                    <Link
                        href="/admin/exhibitions"
                        className="mb-5 inline-block text-sm text-neutral-500 hover:text-neutral-950"
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

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
                <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/admin/exhibitions/${exhibition.id}`,
                                )
                            }
                            className="mb-4 text-sm text-neutral-500 transition hover:text-neutral-950"
                        >
                            ← Back to exhibition review
                        </button>

                        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                            {exhibition.name}
                        </h1>

                        <p className="mt-2 text-sm text-neutral-500">
                            Manage solo exhibition
                        </p>
                    </div>

                    <ExhibitionPublishToggle
                        exhibition={exhibition}
                        onExhibitionChange={setExhibition}
                        onError={setError}
                    />
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    <ExhibitionInfoEditor
                        exhibition={exhibition}
                        onExhibitionChange={setExhibition}
                        onError={setError}
                    />

                    <ExhibitionMediaManager
                        exhibition={exhibition}
                        onExhibitionChange={setExhibition}
                        onError={setError}
                    />
                </div>
            </div>
        </main>
    );
}
