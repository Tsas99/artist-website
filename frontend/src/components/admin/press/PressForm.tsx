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
    PressFormData,
    UploadedPressImage,
} from './types';

const EMPTY_FORM: PressFormData = {
    name: '',
    details: '',
    link: '',
    isPublished: true,
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

export default function PressForm() {
    const router = useRouter();

    const [form, setForm] =
        useState<PressFormData>(
            EMPTY_FORM,
        );

    const [cover, setCover] =
        useState<UploadedPressImage | null>(
            null,
        );

    const [images, setImages] =
        useState<UploadedPressImage[]>(
            [],
        );

    const [saving, setSaving] =
        useState(false);

    const [cancelling, setCancelling] =
        useState(false);

    const [error, setError] =
        useState('');

    /*
     * Every Cloudinary asset uploaded
     * during this unsaved form session.
     *
     * A ref is used because this is cleanup
     * bookkeeping, not UI state.
     */
    const uploadedAssetsRef =
        useRef<
            Map<
                string,
                UploadedPressImage
            >
        >(new Map());

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

    async function cleanupAssets(
        assets: UploadedPressImage[],
    ) {
        const results =
            await Promise.allSettled(
                assets.map((asset) =>
                    deleteCloudinaryAsset(
                        asset.publicId,
                    ),
                ),
            );

        return results.every(
            (result) =>
                result.status ===
                'fulfilled',
        );
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
            const payload = {
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

                media:
                    images.map(
                        (
                            image,
                            index,
                        ) => ({
                            url: image.url,
                            publicId:
                                image.publicId,
                            sortOrder:
                                index,
                        }),
                    ),
            };

            const response =
                await adminFetch(
                    '/api/admin/press',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body:
                            JSON.stringify(
                                payload,
                            ),
                    },
                );

            if (!response.ok) {
                let message =
                    'Failed to create press entry.';

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
             * The uploaded files now belong
             * to the saved Press entry.
             * They are no longer orphans.
             */
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
            const assets =
                Array.from(
                    uploadedAssetsRef.current.values(),
                );

            if (
                assets.length > 0
            ) {
                const cleaned =
                    await cleanupAssets(
                        assets,
                    );

                if (!cleaned) {
                    setError(
                        'Some uploaded images could not be removed. Please try Cancel again.',
                    );

                    return;
                }

                uploadedAssetsRef.current.clear();
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
            onSubmit={
                handleSubmit
            }
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
                        value={
                            form.name
                        }
                        onChange={(
                            event,
                        ) =>
                            updateForm(
                                'name',
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Ulaanbaatar Biennale 2025 Catalogue"
                        required
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />

                    {form.name.trim() && (
                        <p className="mt-2 text-xs text-neutral-400">
                            /press/
                            {createSlug(
                                form.name,
                            ) ||
                                '...'}
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
                        value={
                            form.details
                        }
                        onChange={(
                            event,
                        ) =>
                            updateForm(
                                'details',
                                event.target
                                    .value,
                            )
                        }
                        rows={4}
                        placeholder={'2025\nExhibition Catalogue'}
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
                        value={
                            form.link
                        }
                        onChange={(
                            event,
                        ) =>
                            updateForm(
                                'link',
                                event.target
                                    .value,
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
                    onChange={
                        setCover
                    }
                    onUploaded={
                        registerUploadedAsset
                    }
                />
            </div>

            <div className="border-t border-neutral-200 pt-8">
                <PressImagesUpload
                    images={images}
                    onChange={
                        setImages
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
                        onChange={(
                            event,
                        ) =>
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

                <p className="mt-2 text-xs text-neutral-400">
                    Turn this off to
                    save the entry as a
                    draft.
                </p>
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
                        ? 'Creating...'
                        : 'Create Press'}
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