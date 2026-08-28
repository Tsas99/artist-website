'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeleteWorkProps = {
    workId: number;
    title: string;
};

export default function DeleteWork({
    workId,
    title,
}: DeleteWorkProps) {
    const router = useRouter();

    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    async function deleteWork() {
        try {
            setIsDeleting(true);
            setError('');

            const response = await fetch(
                `http://localhost:3001/works/${workId}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Delete failed:', errorData);

                throw new Error('Failed to delete work');
            }

            router.push('/admin/works');
            router.refresh();
        } catch (err) {
            console.error(err);
            setError('Work could not be deleted.');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="flex h-9 items-center">
                <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-sm font-medium leading-none text-red-600 transition hover:bg-red-50"
                >
                    Delete
                </button>
            </div>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => {
                        if (!isDeleting) {
                            setShowConfirm(false);
                            setError('');
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Delete work?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Are you sure you want to permanently delete{' '}
                            <span className="font-medium text-neutral-900">
                                &ldquo;{title}&rdquo;
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {error && (
                            <p className="mt-3 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowConfirm(false);
                                    setError('');
                                }}
                                disabled={isDeleting}
                                className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={deleteWork}
                                disabled={isDeleting}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, delete work'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}