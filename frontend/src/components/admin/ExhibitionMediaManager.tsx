
'use client';

import { useRef, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

import type {
    Exhibition,
    ExhibitionMedia,
} from './ExhibitionInfoEditor';

type Props = {
    exhibition: Exhibition;
    onExhibitionChange: (exhibition: Exhibition) => void;
    onError: (message: string) => void;
};

export default function ExhibitionMediaManager({
    exhibition,
    onExhibitionChange,
    onError,
}: Props) {
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [uploadingCover, setUploadingCover] = useState(false);
    const [removingCover, setRemovingCover] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [busyMediaId, setBusyMediaId] = useState<number | null>(
        null,
    );

    const media = [...(exhibition.media ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );

    async function reloadExhibition() {
        const response = await adminFetch(
            `/api/admin/exhibitions/${exhibition.id}`,
        );

        if (!response.ok) {
            throw new Error('Failed to refresh exhibition.');
        }

        const updated: Exhibition = await response.json();
        onExhibitionChange(updated);
    }

    async function handleCoverUpload(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            onError('Poster must be JPG, PNG or WebP.');
            event.target.value = '';
            return;
        }

        if (file.size > 30 * 1024 * 1024) {
            onError('Poster must be smaller than 30 MB.');
            event.target.value = '';
            return;
        }

        setUploadingCover(true);
        onError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await adminFetch(
                `/api/admin/exhibitions/${exhibition.id}/cover`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!response.ok) {
                throw new Error('Failed to upload exhibition poster.');
            }

            await reloadExhibition();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Poster upload failed.',
            );
        } finally {
            setUploadingCover(false);
            if (coverInputRef.current) {
                coverInputRef.current.value = '';
            }
        }
    }

    async function handleCoverDelete() {
        if (!window.confirm('Remove exhibition poster?')) {
            return;
        }

        setRemovingCover(true);
        onError('');

        try {
            const response = await adminFetch(
                `/api/admin/exhibitions/${exhibition.id}/cover`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                throw new Error('Failed to remove poster.');
            }

            await reloadExhibition();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Could not remove poster.',
            );
        } finally {
            setRemovingCover(false);
        }
    }

    async function handleGalleryUpload(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setUploadingGallery(true);
        onError('');

        let uploadedCount = 0;

        try {
            for (const file of files) {
                const isImage = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                ].includes(file.type);

                const isVideo = [
                    'video/mp4',
                    'video/webm',
                    'video/quicktime',
                ].includes(file.type);

                if (!isImage && !isVideo) {
                    throw new Error(
                        `Unsupported file type: ${file.name}`,
                    );
                }

                const maxSize = isVideo
                    ? 100 * 1024 * 1024
                    : 30 * 1024 * 1024;

                if (file.size > maxSize) {
                    throw new Error(
                        `File too large: ${file.name}`,
                    );
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append(
                    'exhibitionId',
                    String(exhibition.id),
                );

                const response = await adminFetch(
                    '/api/admin/exhibition-media/upload',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to upload: ${file.name}`,
                    );
                }

                uploadedCount += 1;
            }
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Gallery upload failed.',
            );
        } finally {
            if (uploadedCount > 0) {
                try {
                    await reloadExhibition();
                } catch {
                    onError('Media uploaded, but refreshing failed.');
                }
            }

            setUploadingGallery(false);

            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
        }
    }

    async function handleMediaDelete(item: ExhibitionMedia) {
        if (!window.confirm('Delete this media file?')) {
            return;
        }

        setBusyMediaId(item.id);
        onError('');

        try {
            const response = await adminFetch(
                `/api/admin/exhibition-media/${item.id}`,
                { method: 'DELETE' },
            );

            if (!response.ok) {
                throw new Error('Failed to delete media.');
            }

            await reloadExhibition();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Could not delete media.',
            );
        } finally {
            setBusyMediaId(null);
        }
    }

    async function handleMove(
        index: number,
        direction: -1 | 1,
    ) {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= media.length) {
            return;
        }

        const current = media[index];
        const target = media[targetIndex];

        setBusyMediaId(current.id);
        onError('');

        try {
            const firstResponse = await adminFetch(
                `/api/admin/exhibition-media/${current.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sortOrder: target.sortOrder,
                    }),
                },
            );

            if (!firstResponse.ok) {
                throw new Error('Failed to reorder media.');
            }

            const secondResponse = await adminFetch(
                `/api/admin/exhibition-media/${target.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sortOrder: current.sortOrder,
                    }),
                },
            );

            if (!secondResponse.ok) {
                throw new Error('Failed to reorder media.');
            }

            await reloadExhibition();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Could not change media order.',
            );
        } finally {
            setBusyMediaId(null);
        }
    }

    const isBusy =
        uploadingCover ||
        removingCover ||
        uploadingGallery ||
        busyMediaId !== null;

    return (
        <section className="space-y-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                <h2 className="text-xl font-semibold text-neutral-950">
                    Exhibition Poster
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                    Main poster displayed on the exhibition page.
                </p>

                <div className="mt-6">
                    {exhibition.coverUrl ? (
                        <img
                            src={exhibition.coverUrl}
                            alt={`${exhibition.name} poster`}
                            className="max-h-[480px] w-full object-contain"
                        />
                    ) : (
                        <div className="flex min-h-48 items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400">
                            No poster uploaded
                        </div>
                    )}
                </div>

                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    disabled={isBusy}
                    className="mt-5 block w-full text-sm text-neutral-600"
                />

                {exhibition.coverUrl && (
                    <button
                        type="button"
                        onClick={handleCoverDelete}
                        disabled={isBusy}
                        className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                        {removingCover ? 'Removing...' : 'Remove Poster'}
                    </button>
                )}

                {uploadingCover && (
                    <p className="mt-3 text-sm text-neutral-500">
                        Uploading poster...
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                <h2 className="text-xl font-semibold text-neutral-950">
                    Exhibition Documentation
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                    Installation views, opening documentation,
                    audience photographs and videos.
                </p>

                <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    onChange={handleGalleryUpload}
                    disabled={isBusy}
                    className="mt-6 block w-full text-sm text-neutral-600"
                />

                {uploadingGallery && (
                    <p className="mt-3 text-sm text-neutral-500">
                        Uploading documentation...
                    </p>
                )}

                {media.length === 0 ? (
                    <p className="mt-6 text-sm text-neutral-400">
                        No documentation uploaded yet.
                    </p>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                        {media.map((item, index) => (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-xl border border-neutral-200"
                            >
                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        controls
                                        preload="metadata"
                                        className="aspect-video w-full bg-neutral-100 object-contain"
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={`${exhibition.name} documentation`}
                                        className="aspect-video w-full bg-neutral-100 object-contain"
                                    />
                                )}

                                <div className="flex items-center justify-between gap-2 p-3">
                                    <span className="text-xs text-neutral-500">
                                        {index + 1} / {media.length}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, -1)}
                                            disabled={isBusy || index === 0}
                                            className="rounded-lg border px-2 py-1 text-sm disabled:opacity-30"
                                            aria-label="Move media up"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleMove(index, 1)}
                                            disabled={
                                                isBusy ||
                                                index === media.length - 1
                                            }
                                            className="rounded-lg border px-2 py-1 text-sm disabled:opacity-30"
                                            aria-label="Move media down"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleMediaDelete(item)}
                                            disabled={isBusy}
                                            className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-700 disabled:opacity-30"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
