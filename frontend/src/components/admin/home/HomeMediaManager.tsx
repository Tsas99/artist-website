'use client';

import {
    ChangeEvent,
    useEffect,
    useState,
} from 'react';

import { adminFetch } from '@/lib/admin-fetch';

type HomeMedia = {
    id: number;
    url: string;
    publicId: string;
    sortOrder: number;
    createdAt: string;
};

type UploadedMedia = {
    url: string;
    publicId: string;
    type: 'image' | 'video';
};

export default function HomeMediaManager() {
    const [items, setItems] =
        useState<HomeMedia[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isUploading, setIsUploading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState('');

    async function loadItems() {
        try {
            setError('');

            const response = await adminFetch(
                '/api/admin/home-media',
                {
                    cache: 'no-store',
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to load home images.',
                );
            }

            const data =
                (await response.json()) as HomeMedia[];

            setItems(data);
        } catch (error) {
            console.error(error);

            setError(
                'Unable to load home images.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadItems();
    }, []);

    async function handleUpload(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        // Allow choosing the same file again later.
        event.target.value = '';

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(
                'Please choose an image file.',
            );
            return;
        }

        setIsUploading(true);
        setError('');

        let uploaded:
            | UploadedMedia
            | undefined;

        try {
            const formData = new FormData();

            formData.append('file', file);

            const uploadResponse =
                await adminFetch(
                    '/api/admin/upload/media',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

            if (!uploadResponse.ok) {
                throw new Error(
                    'Image upload failed.',
                );
            }

            uploaded =
                (await uploadResponse.json()) as UploadedMedia;

            if (uploaded.type !== 'image') {
                throw new Error(
                    'Only images can be used on the home page.',
                );
            }

            const nextSortOrder =
                items.length === 0
                    ? 0
                    : Math.max(
                        ...items.map(
                            (item) =>
                                item.sortOrder,
                        ),
                    ) + 1;

            const createResponse =
                await adminFetch(
                    '/api/admin/home-media',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            url: uploaded.url,
                            publicId:
                                uploaded.publicId,
                            sortOrder:
                                nextSortOrder,
                        }),
                    },
                );

            if (!createResponse.ok) {
                throw new Error(
                    'Unable to save home image.',
                );
            }

            await loadItems();
        } catch (error) {
            console.error(error);

            // Cloudinary upload succeeded but DB create failed.
            // Remove the orphan upload.
            if (uploaded) {
                try {
                    await adminFetch(
                        '/api/admin/upload/media',
                        {
                            method: 'DELETE',
                            headers: {
                                'Content-Type':
                                    'application/json',
                            },
                            body: JSON.stringify({
                                publicId:
                                    uploaded.publicId,
                                type: 'image',
                            }),
                        },
                    );
                } catch (
                cleanupError
                ) {
                    console.error(
                        'Home image cleanup failed:',
                        cleanupError,
                    );
                }
            }

            setError(
                'Unable to add the image.',
            );
        } finally {
            setIsUploading(false);
        }
    }


    async function handleRemove(
        id: number,
    ) {
        const confirmed =
            window.confirm(
                'Remove this image from the home page?',
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);
        setError('');

        try {
            const response =
                await adminFetch(
                    `/api/admin/home-media/${id}`,
                    {
                        method: 'DELETE',
                    },
                );

            if (!response.ok) {
                throw new Error(
                    'Unable to remove image.',
                );
            }

            setItems((current) =>
                current.filter(
                    (item) =>
                        item.id !== id,
                ),
            );
        } catch (error) {
            console.error(error);

            setError(
                'Unable to remove the image.',
            );
        } finally {
            setDeletingId(null);
        }
    }
    async function handleMove(
        index: number,
        direction: 'up' | 'down',
    ) {
        const targetIndex =
            direction === 'up'
                ? index - 1
                : index + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= items.length
        ) {
            return;
        }

        const currentItem = items[index];
        const targetItem = items[targetIndex];

        setError('');

        try {
            const currentResponse =
                await adminFetch(
                    `/api/admin/home-media/${currentItem.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            sortOrder:
                                targetItem.sortOrder,
                        }),
                    },
                );

            if (!currentResponse.ok) {
                throw new Error(
                    'Unable to update image order.',
                );
            }

            const targetResponse =
                await adminFetch(
                    `/api/admin/home-media/${targetItem.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            sortOrder:
                                currentItem.sortOrder,
                        }),
                    },
                );

            if (!targetResponse.ok) {
                throw new Error(
                    'Unable to update image order.',
                );
            }

            await loadItems();
        } catch (error) {
            console.error(error);

            setError(
                'Unable to change image order.',
            );
        }
    }
    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-medium">
                        Home
                    </h1>

                    <p className="mt-2 text-sm text-neutral-500">
                        Manage the images shown on
                        the home page.
                    </p>
                </div>

                <label
                    className={`cursor-pointer bg-neutral-950 px-5 py-3 text-sm text-white transition-opacity hover:opacity-70 ${isUploading
                        ? 'pointer-events-none opacity-40'
                        : ''
                        }`}
                >
                    {isUploading
                        ? 'Uploading...'
                        : 'Add Image'}

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={handleUpload}
                    />
                </label>
            </div>

            {error && (
                <p className="mt-6 text-sm text-neutral-600">
                    {error}
                </p>
            )}

            {isLoading ? (
                <p className="mt-10 text-sm text-neutral-500">
                    Loading...
                </p>
            ) : items.length === 0 ? (
                <div className="mt-10 border-t border-neutral-200 pt-8">
                    <p className="text-sm text-neutral-500">
                        No home images yet.
                    </p>
                </div>
            ) : (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(
                        (item, index) => (
                            <div
                                key={item.id}
                                className="min-w-0"
                            >
                                <div className="flex min-h-[260px] items-center justify-center bg-neutral-50">
                                    <img
                                        src={item.url}
                                        alt=""
                                        className="max-h-[420px] w-full object-contain"
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-4">
                                    <span className="text-xs text-neutral-500">
                                        {String(index + 1).padStart(
                                            2,
                                            '0',
                                        )}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() =>
                                                handleMove(index, 'up')
                                            }
                                            className="text-xs text-neutral-500 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-20"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                index ===
                                                items.length - 1
                                            }
                                            onClick={() =>
                                                handleMove(index, 'down')
                                            }
                                            className="text-xs text-neutral-500 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-20"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                deletingId === item.id
                                            }
                                            onClick={() =>
                                                handleRemove(item.id)
                                            }
                                            className="text-xs text-neutral-500 transition-colors hover:text-neutral-950 disabled:opacity-40"
                                        >
                                            {deletingId === item.id
                                                ? 'Removing...'
                                                : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}