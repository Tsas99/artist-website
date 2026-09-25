'use client';

import {
    FormEvent,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';
import type { NewsItem } from './types';

type Props = {
    news: NewsItem;
};

export default function NewsEditForm({
    news,
}: Props) {
    const router = useRouter();

    const [posterUrl, setPosterUrl] =
        useState(news.posterUrl ?? '');

    const [
        posterPublicId,
        setPosterPublicId,
    ] = useState(
        news.posterPublicId ?? '',
    );

    const [
        newPosterUploaded,
        setNewPosterUploaded,
    ] = useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    async function deleteUploadedPoster(
        publicId: string,
    ) {
        if (!publicId) {
            return;
        }

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
    }

    async function handlePosterUpload(
        file: File,
    ) {
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
                    'Poster upload failed.',
                );
            }

            const uploaded =
                await response.json();

            if (
                uploaded.type !==
                'image'
            ) {
                await deleteUploadedPoster(
                    uploaded.publicId,
                );

                throw new Error(
                    'Poster must be an image.',
                );
            }

            /*
             * If the user already uploaded a
             * replacement during this edit
             * session, remove that temporary
             * replacement before using the
             * newest one.
             */
            if (
                newPosterUploaded &&
                posterPublicId &&
                posterPublicId !==
                news.posterPublicId
            ) {
                await deleteUploadedPoster(
                    posterPublicId,
                );
            }

            setPosterUrl(
                uploaded.url,
            );

            setPosterPublicId(
                uploaded.publicId,
            );

            setNewPosterUploaded(
                true,
            );
        } catch (error) {
            console.error(error);

            setError(
                'Unable to upload poster.',
            );
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const form =
            event.currentTarget;

        const formData =
            new FormData(form);

        const title = String(
            formData.get('title') ?? '',
        ).trim();

        if (!title) {
            setError(
                'Title is required.',
            );
            return;
        }

        const payload = {
            title,

            /*
             * Keep the existing slug.
             * Changing the title should not
             * unexpectedly break an existing
             * public URL.
             */
            slug: news.slug,

            category:
                String(
                    formData.get(
                        'category',
                    ) ?? '',
                ).trim() ||
                undefined,

            date:
                String(
                    formData.get(
                        'date',
                    ) ?? '',
                ).trim() ||
                undefined,

            location:
                String(
                    formData.get(
                        'location',
                    ) ?? '',
                ).trim() ||
                undefined,

            description:
                String(
                    formData.get(
                        'description',
                    ) ?? '',
                ).trim() ||
                undefined,

            posterUrl:
                posterUrl ||
                undefined,

            posterPublicId:
                posterPublicId ||
                undefined,

            externalLink:
                String(
                    formData.get(
                        'externalLink',
                    ) ?? '',
                ).trim() ||
                undefined,

            isPublished:
                formData.get(
                    'isPublished',
                ) === 'on',
        };

        setSaving(true);
        setError('');

        try {
            const response =
                await adminFetch(
                    `/api/admin/news/${news.id}`,
                    {
                        method: 'PATCH',
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
                const responseText =
                    await response.text();

                setError(
                    `Status ${response.status}: ${responseText ||
                    'Unable to update news.'
                    }`,
                );

                return;
            }

            /*
             * DB now points to the new poster,
             * so it is safe to delete the old
             * Cloudinary asset.
             */
            if (
                newPosterUploaded &&
                news.posterPublicId &&
                news.posterPublicId !==
                posterPublicId
            ) {
                try {
                    await deleteUploadedPoster(
                        news.posterPublicId,
                    );
                } catch (error) {
                    console.error(
                        'Old poster cleanup failed:',
                        error,
                    );
                }
            }

            router.push(
                '/admin/news',
            );

            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                'Unable to update news.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleCancel() {
        /*
         * A new poster may already be on
         * Cloudinary even though the DB has
         * not been updated. Clean it up.
         */
        if (
            newPosterUploaded &&
            posterPublicId &&
            posterPublicId !==
            news.posterPublicId
        ) {
            try {
                await deleteUploadedPoster(
                    posterPublicId,
                );
            } catch (error) {
                console.error(
                    'Temporary poster cleanup failed:',
                    error,
                );
            }
        }

        router.push(
            '/admin/news',
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl space-y-8"
        >
            <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-neutral-500">
                    Poster
                </label>

                {posterUrl ? (
                    <div className="mb-4">
                        <img
                            src={posterUrl}
                            alt=""
                            className="max-h-[420px] max-w-full object-contain"
                        />
                    </div>
                ) : (
                    <p className="mb-4 text-xs text-neutral-400">
                        No poster
                    </p>
                )}

                <label
                    className={`inline-flex cursor-pointer items-center border border-neutral-300 px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:border-neutral-950 ${uploading || saving
                            ? 'pointer-events-none opacity-40'
                            : ''
                        }`}
                >
                    {uploading
                        ? 'Uploading...'
                        : posterUrl
                            ? 'Change Poster'
                            : 'Add Poster'}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={
                            uploading ||
                            saving
                        }
                        className="hidden"
                        onChange={(event) => {
                            const file =
                                event.target
                                    .files?.[0];

                            if (file) {
                                void handlePosterUpload(
                                    file,
                                );
                            }

                            event.target.value =
                                '';
                        }}
                    />
                </label>
            </div>

            <Field
                label="Title *"
                name="title"
                defaultValue={
                    news.title
                }
                required
                maxLength={200}
            />

            <Field
                label="Category"
                name="category"
                defaultValue={
                    news.category ??
                    ''
                }
                placeholder="Solo Exhibition"
                maxLength={100}
            />

            <Field
                label="Date"
                name="date"
                defaultValue={
                    news.date ?? ''
                }
                placeholder="17–18 September 2027"
                maxLength={100}
            />

            <Field
                label="Location"
                name="location"
                defaultValue={
                    news.location ??
                    ''
                }
                placeholder="Tokyo, Japan"
                maxLength={200}
            />

            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-xs uppercase tracking-[0.12em] text-neutral-500"
                >
                    Description
                    (optional)
                </label>

                <textarea
                    id="description"
                    name="description"
                    rows={8}
                    maxLength={
                        10000
                    }
                    defaultValue={
                        news.description ??
                        ''
                    }
                    className="w-full border border-neutral-300 p-3 text-sm outline-none transition-colors focus:border-neutral-950"
                />
            </div>

            <Field
                label="External Link"
                name="externalLink"
                type="url"
                defaultValue={
                    news.externalLink ??
                    ''
                }
                placeholder="https://..."
            />

            <label className="flex items-center gap-3 text-sm">
                <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={
                        news.isPublished
                    }
                />

                Published
            </label>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex items-center gap-5">
                <button
                    type="submit"
                    disabled={
                        saving ||
                        uploading
                    }
                    className="bg-neutral-950 px-6 py-3 text-sm text-white disabled:opacity-40"
                >
                    {saving
                        ? 'Saving...'
                        : 'Save Changes'}
                </button>

                <button
                    type="button"
                    disabled={
                        saving ||
                        uploading
                    }
                    onClick={() =>
                        void handleCancel()
                    }
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-950 disabled:opacity-40"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

type FieldProps = {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    defaultValue?: string;
};

function Field({
    label,
    name,
    type = 'text',
    placeholder,
    required,
    maxLength,
    defaultValue,
}: FieldProps) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-xs uppercase tracking-[0.12em] text-neutral-500"
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                required={
                    required
                }
                maxLength={
                    maxLength
                }
                placeholder={
                    placeholder
                }
                defaultValue={
                    defaultValue
                }
                className="w-full border-b border-neutral-300 py-2 text-sm outline-none transition-colors focus:border-neutral-950"
            />
        </div>
    );
}