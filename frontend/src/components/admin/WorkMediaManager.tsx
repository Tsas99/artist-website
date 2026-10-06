'use client';

import { useEffect, useState } from 'react';
import type { Work } from './WorkInfoEditor';
import { adminFetch } from '@/lib/admin-fetch';

type WorkMedia = {
    id: number;
    url: string;
    publicId: string;
    type: 'image' | 'video';
    sortOrder: number;
    workId: number;
};



type Props = {
    work: Work;
    onWorkChange: (work: Work) => void;
    onError: (message: string) => void;
};

export default function WorkMediaManager({
    work,
    onWorkChange,
    onError,
}: Props) {
    const [media, setMedia] = useState<WorkMedia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadMedia();
    }, [work.id]);

    async function loadMedia() {
        try {
            setIsLoading(true);
            onError('');

            const response = await adminFetch(
                `/api/admin/work-media/work/${work.id}`,
                {
                    cache: 'no-store',
                },
            );

            if (!response.ok) {
                throw new Error('Failed to load media');
            }

            const data: WorkMedia[] = await response.json();

            setMedia(data);
        } catch (error) {
            console.error(error);
            onError('Media could not be loaded.');
        } finally {
            setIsLoading(false);
        }
    }
    async function handleMediaUpload(files: FileList) {
        if (isUploading) return;

        setIsUploading(true);
        onError('');

        let successfulUploads = 0;

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();

                formData.append('file', file);
                formData.append('workId', String(work.id));

                // Backend handles:
                // Sharp optimization
                // Cloudinary upload
                // PostgreSQL save
                // Cleanup if database save fails
                const response = await adminFetch(
                    '/api/admin/work-media/upload',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!response.ok) {
                    const errorText = await response.text();

                    throw new Error(
                        `Media upload failed: ${errorText}`,
                    );
                }

                successfulUploads++;
            }
        } catch (error) {
            console.error('Media upload failed:', error);

            onError(
                error instanceof Error
                    ? error.message
                    : 'Media could not be uploaded.',
            );
        } finally {
            try {
                // Refresh the gallery even when an earlier
                // file succeeded but a later file failed.
                await loadMedia();
            } finally {
                setIsUploading(false);
            }
        }
    }

    async function setCoverImage(item: WorkMedia) {
        try {
            onError('');

            const response = await adminFetch(
                `/api/admin/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: item.url,
                        imagePublicId: item.publicId,
                    }),
                },
            );

            if (!response.ok) {
                const responseText = await response.text();

                console.error(
                    'Cover update failed:',
                    responseText,
                );

                throw new Error(
                    'Failed to change cover image',
                );
            }

            const updatedWork: Work =
                await response.json();

            onWorkChange(updatedWork);
        } catch (error) {
            console.error(error);

            onError(
                'Cover image could not be changed.',
            );
        }
    }

    async function removeMedia(item: WorkMedia) {
        try {
            onError('');

            const response = await adminFetch(
                `/api/admin/work-media/${item.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const responseText = await response.text();

                console.error(
                    'Media deletion failed:',
                    responseText,
                );

                throw new Error(
                    'Failed to remove media',
                );
            }

            // Backend updates the cover if necessary.
            // Refresh the Work information.
            const workResponse = await adminFetch(
                `/api/admin/works/${work.id}`,
                {
                    cache: 'no-store',
                },
            );

            if (!workResponse.ok) {
                throw new Error(
                    'Failed to refresh work',
                );
            }

            const updatedWork: Work =
                await workResponse.json();

            onWorkChange(updatedWork);

            // Remove the deleted item from the gallery.
            setMedia((current) =>
                current.filter(
                    (mediaItem) =>
                        mediaItem.id !== item.id,
                ),
            );
        } catch (error) {
            console.error(error);

            onError(
                'Media could not be removed.',
            );
        }
    }


    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-950">
                        Media
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Add images or videos, choose a cover image,
                        or remove media.
                    </p>
                </div>

                <label
                    className={`inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition ${isUploading
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-neutral-800'
                        }`}
                >
                    {isUploading
                        ? 'Uploading...'
                        : 'Add image / video'}

                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(event) => {
                            const files = event.target.files;

                            if (files?.length) {
                                handleMediaUpload(files);
                            }

                            event.target.value = '';
                        }}
                    />
                </label>
            </div>

            {isLoading ? (
                <p className="mt-6 text-sm text-neutral-500">
                    Loading media...
                </p>
            ) : media.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {media.map((item, index) => {
                        const isCover =
                            item.type === 'image' &&
                            work.imageUrl === item.url;

                        return (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                            >
                                <div className="relative aspect-[4/3] bg-neutral-100">
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.url}
                                            alt={`${work.title} image ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={item.url}
                                            controls
                                            preload="metadata"
                                            className="h-full w-full object-cover"
                                        />
                                    )}

                                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium capitalize text-neutral-700">
                                        {item.type}
                                    </span>

                                    {isCover && (
                                        <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                                            Cover
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 p-4">
                                    {item.type === 'image' && (
                                        <>
                                            {isCover ? (
                                                <div className="flex min-h-11 items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
                                                    Cover photo
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCoverImage(
                                                            item
                                                        )
                                                    }
                                                    className="min-h-11 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                                                >
                                                    Choose as cover
                                                </button>
                                            )}
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeMedia(item)
                                        }
                                        className="min-h-11 w-full rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="mt-6 text-sm text-neutral-500">
                    No media added yet.
                </p>
            )}
        </section>
    );
}