'use client';

import {
    type ChangeEvent,
    useState,
} from 'react';

import { adminFetch } from '@/lib/admin-fetch';
import type { UploadedPressImage } from './types';

type PressCoverUploadProps = {
    cover: UploadedPressImage | null;

    onChange: (
        cover: UploadedPressImage,
    ) => void;

    onUploaded: (
        image: UploadedPressImage,
    ) => void;
};

export default function PressCoverUpload({
    cover,
    onChange,
    onUploaded,
}: PressCoverUploadProps) {
    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState('');

    async function handleUpload(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file =
            event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        setUploading(true);
        setError('');

        try {
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
                    'Failed to upload cover.',
                );
            }

            const data =
                await response.json();

            const uploaded: UploadedPressImage =
            {
                url: data.url,
                publicId:
                    data.publicId,
            };

            /*
             * Parent tracks every newly
             * uploaded asset for cleanup.
             */
            onUploaded(uploaded);

            /*
             * Replace current UI cover.
             * Existing DB/Cloudinary cover
             * is NOT deleted here.
             */
            onChange(uploaded);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Cover upload failed.',
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <section>
            <div className="mb-3">
                <h2 className="text-sm font-medium text-neutral-950">
                    Cover
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                    Main cover image for
                    this publication.
                </p>
            </div>

            {cover && (
                <div className="mb-4 max-w-sm">
                    <img
                        src={cover.url}
                        alt=""
                        className="h-auto w-full"
                    />
                </div>
            )}

            <label className="inline-flex cursor-pointer border border-neutral-300 px-4 py-2.5 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950">
                {uploading
                    ? 'Uploading...'
                    : cover
                        ? 'Replace Cover'
                        : 'Upload Cover'}

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
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
        </section>
    );
}