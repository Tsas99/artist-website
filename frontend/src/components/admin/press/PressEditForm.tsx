'use client';

import {
    type FormEvent,
    useRef,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';

import PressCoverUpload from './PressCoverUpload';
import PressImagesUpload from './PressImagesUpload';

import type {
    PressEntry,
    PressFormData,
    PressMedia,
    UploadedPressImage,
} from './types';

type PressEditFormProps = {
    press: PressEntry;
};

function createSlug(value: string) {
    return value
        .normalize('NFKD')
        .toLowerCase()
        .trim()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function PressEditForm({
    press,
}: PressEditFormProps) {
    const router = useRouter();

    const [form, setForm] =
        useState<PressFormData>({
            name: press.name,
            details: press.details ?? '',
            link: press.link ?? '',
            isPublished:
                press.isPublished,
        });

    const [cover, setCover] =
        useState<UploadedPressImage | null>(
            press.coverUrl &&
                press.coverPublicId
                ? {
                    url: press.coverUrl,
                    publicId:
                        press.coverPublicId,
                }
                : null,
        );

    const [existingMedia, setExistingMedia] =
        useState<PressMedia[]>(
            press.media ?? [],
        );

    const [newImages, setNewImages] =
        useState<UploadedPressImage[]>(
            [],
        );

    const [saving, setSaving] =
        useState(false);

    const [cancelling, setCancelling] =
        useState(false);

    const [removingMediaId, setRemovingMediaId] =
        useState<number | null>(
            null,
        );

    const [error, setError] =
        useState('');

    /*
     * Assets uploaded during THIS edit session.
     * If Cancel is pressed, these are deleted.
     */
    const uploadedAssetsRef =
        useRef<
            Map<
                string,
                UploadedPressImage
            >
        >(new Map());

    const originalCover =
        useRef<UploadedPressImage | null>(
            press.coverUrl &&
                press.coverPublicId
                ? {
                    url: press.coverUrl,
                    publicId:
                        press.coverPublicId,
                }
                : null,
        );

    function updateForm<
        K extends keyof PressFormData,
    >(
        field: K,
        value: PressFormData[K],
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function registerUploadedAsset(
        image: UploadedPressImage,
    ) {
        uploadedAssetsRef.current.set(
            image.publicId,
            image,
        );
    }

    async function deleteCloudinaryAsset(
        publicId: string,
    ) {
        const response =
            await adminFetch(
                '/api/admin/upload/media',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        publicId,
                        type: 'image',
                    }),
                },
            );

        if (!response.ok) {
            throw new Error(
                'Failed to remove uploaded image.',
            );
        }
    }

    async function cleanupNewAssets() {
        const assets =
            Array.from(
                uploadedAssetsRef.current.values(),
            );

        if (assets.length === 0) {
            return true;
        }

        const results =
            await Promise.allSettled(
                assets.map((asset) =>
                    deleteCloudinaryAsset(
                        asset.publicId,
                    ),
                ),
            );

        const success =
            results.every(
                (result) =>
                    result.status ===
                    'fulfilled',
            );

        if (success) {
            uploadedAssetsRef.current.clear();
        }

        return success;
    }

    async function handleRemoveExistingMedia(
        media: PressMedia,
    ) {
        if (
            saving ||
            cancelling ||
            removingMediaId !== null
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                'Remove this image?',
            );

        if (!confirmed) {
            return;
        }

        setRemovingMediaId(
            media.id,
        );

        setError('');

        try {
            const response =
                await adminFetch(
                    `/api/admin/press-media/${media.id}`,
                    {
                        method: 'DELETE',
                    },
                );

            if (!response.ok) {
                throw new Error(
                    'Failed to remove image.',
                );
            }

            setExistingMedia(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            media.id,
                    ),
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to remove image.',
            );
        } finally {
            setRemovingMediaId(
                null,
            );
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const name =
            form.name.trim();

        if (!name) {
            setError(
                'Name is required.',
            );
            return;
        }

        const slug =
            createSlug(name);

        if (!slug) {
            setError(
                'Please use a name that can generate a valid URL slug.',
            );
            return;
        }

        if (!cover) {
            setError(
                'Cover image is required.',
            );
            return;
        }

        setSaving(true);
        setError('');

        try {
            /*
             * 1. Update Press fields + cover.
             *
             * Do NOT send "media" here.
             * Existing PressMedia is managed
             * independently.
             */
            const response =
                await adminFetch(
                    `/api/admin/press/${press.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            name,
                            slug,

                            details:
                                form.details.trim() ||
                                undefined,

                            link:
                                form.link.trim() ||
                                undefined,

                            coverUrl:
                                cover.url,

                            coverPublicId:
                                cover.publicId,

                            isPublished:
                                form.isPublished,
                        }),
                    },
                );

            if (!response.ok) {
                let message =
                    'Failed to update press entry.';

                try {
                    const data =
                        await response.json();

                    if (
                        typeof data?.message ===
                        'string'
                    ) {
                        message =
                            data.message;
                    }
                } catch {
                    // Keep default message.
                }

                throw new Error(
                    message,
                );
            }

            /*
             * 2. Attach newly uploaded
             * content images to PressMedia.
             */
            for (
                let index = 0;
                index <
                newImages.length;
                index++
            ) {
                const image =
                    newImages[index];

                const mediaResponse =
                    await adminFetch(
                        '/api/admin/press-media',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/json',
                            },
                            body: JSON.stringify({
                                url: image.url,
                                publicId:
                                    image.publicId,
                                pressId:
                                    press.id,
                                sortOrder:
                                    existingMedia.length +
                                    index,
                            }),
                        },
                    );

                if (!mediaResponse.ok) {
                    throw new Error(
                        'Press was updated, but one or more images could not be attached.',
                    );
                }

                /*
                 * This asset is now saved
                 * in PressMedia and must NOT
                 * be deleted by cleanup.
                 */
                uploadedAssetsRef.current.delete(
                    image.publicId,
                );
            }

            /*
             * 3. Cover is now saved.
             * Remove it from orphan tracking.
             */
            uploadedAssetsRef.current.delete(
                cover.publicId,
            );

            /*
             * 4. If the cover changed,
             * delete OLD cover only AFTER
             * the DB update succeeded.
             */

            const oldCover =
                originalCover.current;

            if (
                oldCover &&
                oldCover.publicId !==
                cover.publicId
            ) {
                try {
                    await deleteCloudinaryAsset(
                        oldCover.publicId,
                    );
                } catch (cleanupError) {
                    console.error(
                        'Failed to delete old press cover:',
                        cleanupError,
                    );
                }
            }
            uploadedAssetsRef.current.clear();

            router.push(
                '/admin/press',
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleCancel() {
        if (
            saving ||
            cancelling
        ) {
            return;
        }

        setCancelling(true);
        setError('');

        try {
            const success =
                await cleanupNewAssets();

            if (!success) {
                setError(
                    'Some newly uploaded images could not be removed. Please try Cancel again.',
                );
                return;
            }

            router.push(
                '/admin/press',
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to clean up uploaded images.',
            );
        } finally {
            setCancelling(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-10"
        >
            <section className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label
                        htmlFor="press-name"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Name
                    </label>

                    <input
                        id="press-name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                            updateForm(
                                'name',
                                event.target.value,
                            )
                        }
                        required
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />

                    {form.name.trim() && (
                        <p className="mt-2 text-xs text-neutral-400">
                            /press/
                            {createSlug(
                                form.name,
                            ) || '...'}
                        </p>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <label
                        htmlFor="press-details"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Details{' '}
                        <span className="text-neutral-400">
                            (optional)
                        </span>
                    </label>

                    <textarea
                        id="press-details"
                        value={form.details}
                        onChange={(event) =>
                            updateForm(
                                'details',
                                event.target.value,
                            )
                        }
                        rows={4}
                        className="w-full resize-y border border-neutral-300 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-neutral-950"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label
                        htmlFor="press-link"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Link{' '}
                        <span className="text-neutral-400">
                            (optional)
                        </span>
                    </label>

                    <input
                        id="press-link"
                        type="url"
                        value={form.link}
                        onChange={(event) =>
                            updateForm(
                                'link',
                                event.target.value,
                            )
                        }
                        placeholder="https://..."
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />
                </div>
            </section>

            <div className="border-t border-neutral-200 pt-8">
                <PressCoverUpload
                    cover={cover}
                    onChange={setCover}
                    onUploaded={
                        registerUploadedAsset
                    }
                />
            </div>

            <div className="border-t border-neutral-200 pt-8">
                <h2 className="text-sm font-medium text-neutral-950">
                    Existing Images
                </h2>

                {existingMedia.length ===
                    0 ? (
                    <p className="mt-3 text-sm text-neutral-400">
                        No existing images.
                    </p>
                ) : (
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {existingMedia.map(
                            (
                                media,
                                index,
                            ) => (
                                <div
                                    key={
                                        media.id
                                    }
                                >
                                    <img
                                        src={
                                            media.url
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
                                            disabled={
                                                removingMediaId ===
                                                media.id
                                            }
                                            onClick={() =>
                                                handleRemoveExistingMedia(
                                                    media,
                                                )
                                            }
                                            className="text-xs text-red-600 transition hover:text-red-800 disabled:opacity-50"
                                        >
                                            {removingMediaId ===
                                                media.id
                                                ? 'Removing...'
                                                : 'Remove'}
                                        </button>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-neutral-200 pt-8">
                <PressImagesUpload
                    images={
                        newImages
                    }
                    onChange={
                        setNewImages
                    }
                    onUploaded={
                        registerUploadedAsset
                    }
                />
            </div>

            <div className="border-t border-neutral-200 pt-8">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={
                            form.isPublished
                        }
                        onChange={(event) =>
                            updateForm(
                                'isPublished',
                                event.target
                                    .checked,
                            )
                        }
                        className="h-4 w-4"
                    />

                    <span className="text-sm text-neutral-700">
                        Published
                    </span>
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-8">
                <button
                    type="submit"
                    disabled={
                        saving ||
                        cancelling
                    }
                    className="bg-neutral-950 px-5 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? 'Saving...'
                        : 'Save Changes'}
                </button>

                <button
                    type="button"
                    disabled={
                        saving ||
                        cancelling
                    }
                    onClick={
                        handleCancel
                    }
                    className="px-2 py-3 text-sm text-neutral-500 transition hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {cancelling
                        ? 'Cleaning up...'
                        : 'Cancel'}
                </button>
            </div>
        </form>
    );
}