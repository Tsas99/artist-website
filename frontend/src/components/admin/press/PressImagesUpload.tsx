'use client';

import {
    type ChangeEvent,
    useState,
} from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import type { UploadedPressImage } from './types';

type PressImagesUploadProps = {
    images: UploadedPressImage[];
    onChange: (
        images: UploadedPressImage[],
    ) => void;
    onUploaded: (
        image: UploadedPressImage,
    ) => void;
};

export default function PressImagesUpload({
    images,
    onChange,
    onUploaded,
}: PressImagesUploadProps) {
    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState('');

    async function uploadFile(
        file: File,
    ): Promise<UploadedPressImage> {
        const formData =
            new FormData();

        formData.append(
            'file',
            file,
        );

        const response =
            await adminFetch(
                '/api/admin/upload/media',
                {
                    method: 'POST',
                    body: formData,
                },
            );

        if (!response.ok) {
            throw new Error(
                `Failed to upload ${file.name}.`,
            );
        }

        const data =
            await response.json();

        return {
            url: data.url,
            publicId: data.publicId,
        };
    }

    async function handleUpload(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const files =
            Array.from(
                event.target.files ?? [],
            );

        event.target.value = '';

        if (files.length === 0) {
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadedImages: UploadedPressImage[] =
                [];

            for (const file of files) {
                const uploaded =
                    await uploadFile(
                        file,
                    );

                onUploaded(uploaded);
                uploadedImages.push(
                    uploaded,
                );
            }

            onChange([
                ...images,
                ...uploadedImages,
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Image upload failed.',
            );
        } finally {
            setUploading(false);
        }
    }

    function removeImage(
        publicId: string,
    ) {
        onChange(
            images.filter(
                (image) =>
                    image.publicId !==
                    publicId,
            ),
        );
    }

    return (
        <section>
            <div className="mb-3">
                <h2 className="text-sm font-medium text-neutral-950">
                    Images
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                    Catalogue pages,
                    article images or other
                    visual material.
                </p>
            </div>

            <label className="inline-flex cursor-pointer border border-neutral-300 px-4 py-2.5 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950">
                {uploading
                    ? 'Uploading...'
                    : 'Add Images'}

                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={
                        uploading
                    }
                    onChange={
                        handleUpload
                    }
                    className="hidden"
                />
            </label>

            {error && (
                <p className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map(
                        (
                            image,
                            index,
                        ) => (
                            <div
                                key={
                                    image.publicId
                                }
                            >
                                <img
                                    src={
                                        image.url
                                    }
                                    alt=""
                                    className="h-auto w-full"
                                />

                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-xs text-neutral-400">
                                        {index +
                                            1}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(
                                                image.publicId,
                                            )
                                        }
                                        className="text-xs text-red-600 transition hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </section>
    );
}