'use client';

import { useState } from 'react';
import type { Work } from './WorkInfoEditor';

type UploadedImage = {
    imageUrl: string;
    publicId: string;
};

type Props = {
    work: Work;
    onWorkChange: (work: Work) => void;
    onError: (message: string) => void;
};

export default function WorkImagesManager({
    work,
    onWorkChange,
    onError,
}: Props) {
    const [isUploading, setIsUploading] = useState(false);

    async function handleImagesUpload(files: FileList) {
        setIsUploading(true);
        onError('');

        try {
            const uploaded: UploadedImage[] = [];

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(
                    'http://localhost:3001/upload/image',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!response.ok) {
                    throw new Error('Image upload failed');
                }

                const data = await response.json();

                uploaded.push({
                    imageUrl: data.imageUrl,
                    publicId: data.publicId,
                });
            }

            const updatedImageUrls = [
                ...work.imageUrls,
                ...uploaded.map((image) => image.imageUrl),
            ];

            const response = await fetch(
                `http://localhost:3001/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrls: updatedImageUrls,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update gallery');
            }

            const updatedWork: Work = await response.json();

            onWorkChange(updatedWork);
        } catch (error) {
            console.error(error);
            onError('Images could not be uploaded.');
        } finally {
            setIsUploading(false);
        }
    }

    async function setCoverImage(url: string) {
        try {
            const response = await fetch(
                `http://localhost:3001/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: url,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to change cover image');
            }

            const updatedWork: Work = await response.json();

            onWorkChange(updatedWork);
        } catch (error) {
            console.error(error);
            onError('Cover image could not be changed.');
        }
    }

    async function removeImageFromGallery(url: string) {
        const updatedImageUrls = work.imageUrls.filter(
            (image) => image !== url,
        );

        const newCover =
            work.imageUrl === url
                ? updatedImageUrls[0] ?? null
                : work.imageUrl;

        try {
            const response = await fetch(
                `http://localhost:3001/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrls: updatedImageUrls,
                        imageUrl: newCover,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to remove image');
            }

            const updatedWork: Work = await response.json();

            onWorkChange(updatedWork);
        } catch (error) {
            console.error(error);
            onError('Image could not be removed.');
        }
    }

    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-950">
                        Images
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        Add images, choose a cover, or remove images.
                    </p>
                </div>

                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
                    {isUploading ? 'Uploading...' : 'Add images'}

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(event) => {
                            const files = event.target.files;

                            if (files?.length) {
                                handleImagesUpload(files);
                            }
                        }}
                    />
                </label>
            </div>

            {work.imageUrls.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {work.imageUrls.map((url, index) => {
                        const isCover = work.imageUrl === url;

                        return (
                            <div
                                key={`${url}-${index}`}
                                className="overflow-hidden rounded-2xl border border-neutral-200"
                            >
                                <div className="relative aspect-[4/3] bg-neutral-100">
                                    <img
                                        src={url}
                                        alt={`${work.title} image ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />

                                    {isCover && (
                                        <span className="absolute left-3 top-3 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                                            Cover
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 p-4">
                                    {isCover ? (
                                        <div className="flex min-h-11 items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
                                            Cover photo
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setCoverImage(url)}
                                            className="min-h-11 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                                        >
                                            Choose as cover
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImageFromGallery(url)
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
                    No images added yet.
                </p>
            )}
        </section>
    );
}