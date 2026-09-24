'use client';

import {
    FormEvent,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';

function createSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function NewsForm() {
    const router = useRouter();

    const [posterUrl, setPosterUrl] =
        useState('');
    const [
        posterPublicId,
        setPosterPublicId,
    ] = useState('');

    const [uploading, setUploading] =
        useState(false);
    const [saving, setSaving] =
        useState(false);
    const [error, setError] =
        useState('');

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
                uploaded.type !== 'image'
            ) {
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
                            type: uploaded.type,
                        }),
                    },
                );

                throw new Error(
                    'Poster must be an image.',
                );
            }

            setPosterUrl(uploaded.url);
            setPosterPublicId(
                uploaded.publicId,
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

        setSaving(true);
        setError('');

        const payload = {
            title,
            slug: createSlug(title),
            category:
                String(
                    formData.get(
                        'category',
                    ) ?? '',
                ).trim() || undefined,

            date: String(
                formData.get('date') ?? '',
            ).trim() || undefined,
            location:
                String(
                    formData.get(
                        'location',
                    ) ?? '',
                ).trim() || undefined,
            description:
                String(
                    formData.get(
                        'description',
                    ) ?? '',
                ).trim() || undefined,
            posterUrl:
                posterUrl || undefined,
            posterPublicId:
                posterPublicId ||
                undefined,
            externalLink:
                String(
                    formData.get(
                        'externalLink',
                    ) ?? '',
                ).trim() || undefined,
            isPublished:
                formData.get(
                    'isPublished',
                ) === 'on',
        };

        try {
            const response =
                await adminFetch(
                    '/api/admin/news',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify(
                            payload,
                        ),
                    },
                );

            if (!response.ok) {
                const responseText =
                    await response.text();

                setError(
                    `Status ${response.status}: ${responseText ||
                    response.statusText ||
                    'Unknown error'
                    }`,
                );

                return;
            }

            router.push('/admin/news');
            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                'Unable to create news.',
            );
        } finally {
            setSaving(false);
        }
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

                {posterUrl && (
                    <div className="mb-4">
                        <img
                            src={posterUrl}
                            alt=""
                            className="max-h-[420px] max-w-full object-contain"
                        />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading}
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
                    className="text-sm"
                />

                {uploading && (
                    <p className="mt-2 text-xs text-neutral-500">
                        Uploading...
                    </p>
                )}
            </div>

            <Field
                label="Title *"
                name="title"
                required
                maxLength={200}
            />
            <Field
                label="Category"
                name="category"
                placeholder="Solo Exhibition"
                maxLength={100}
            />
            <Field
                label="Date"
                name="date"
                placeholder="17–18 September 2027"
                maxLength={100}
            />

            <Field
                label="Location"
                name="location"
                placeholder="Tokyo, Japan"
                maxLength={200}
            />

            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-xs uppercase tracking-[0.12em] text-neutral-500"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    rows={8}
                    maxLength={10000}
                    className="w-full border border-neutral-300 p-3 text-sm outline-none transition-colors focus:border-neutral-950"
                />
            </div>

            <Field
                label="External Link"
                name="externalLink"
                type="url"
                placeholder="https://..."
            />

            <label className="flex items-center gap-3 text-sm">
                <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked
                />
                Published
            </label>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={
                        saving || uploading
                    }
                    className="bg-neutral-950 px-6 py-3 text-sm text-white disabled:opacity-40"
                >
                    {saving
                        ? 'Saving...'
                        : 'Create News'}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            '/admin/news',
                        )
                    }
                    className="text-sm text-neutral-500"
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
};

function Field({
    label,
    name,
    type = 'text',
    placeholder,
    required,
    maxLength,
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
                required={required}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full border-b border-neutral-300 py-2 text-sm outline-none transition-colors focus:border-neutral-950"
            />
        </div>
    );
}