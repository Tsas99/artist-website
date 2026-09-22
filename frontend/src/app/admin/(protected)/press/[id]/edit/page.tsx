'use client';

import {
    use,
    useEffect,
    useState,
} from 'react';

import PressEditForm from '@/components/admin/press/PressEditForm';
import { adminFetch } from '@/lib/admin-fetch';

import type { PressEntry } from '@/components/admin/press/types';

type EditPressPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditPressPage({
    params,
}: EditPressPageProps) {
    const { id } = use(params);

    const [press, setPress] =
        useState<PressEntry | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    useEffect(() => {
        async function loadPress() {
            try {
                const response =
                    await adminFetch(
                        `/api/admin/press/${id}`,
                    );

                if (!response.ok) {
                    throw new Error(
                        response.status ===
                            404
                            ? 'Press entry not found.'
                            : 'Failed to load press entry.',
                    );
                }

                const data =
                    await response.json();

                setPress(data);
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

        loadPress();
    }, [id]);

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl p-6 sm:p-8">
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            </main>
        );
    }

    if (error || !press) {
        return (
            <main className="mx-auto max-w-5xl p-6 sm:p-8">
                <p className="text-sm text-red-600">
                    {error ||
                        'Press entry not found.'}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl p-6 sm:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                    Edit Press
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    {press.name}
                </p>
            </div>

            <PressEditForm
                press={press}
            />
        </main>
    );
}