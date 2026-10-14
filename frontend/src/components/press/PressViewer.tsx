
'use client';

import Link from 'next/link';
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

type PressMedia = {
    id: number;
    url: string;
    sortOrder: number;
};

type PressViewerProps = {
    name: string;
    details: string | null;
    linkTitle: string | null;
    link: string | null;
    coverUrl: string | null;
    media: PressMedia[];
};

type GalleryImage = {
    id: string;
    url: string;
    alt: string;
};

function getExternalUrl(value: string | null) {
    if (!value?.trim()) return null;

    try {
        const url = new URL(value.trim());

        if (
            url.protocol !== 'http:' &&
            url.protocol !== 'https:'
        ) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}

export default function PressViewer({
    name,
    details,
    linkTitle,
    link,
    coverUrl,
    media,
}: PressViewerProps) {
    const [lightboxIndex, setLightboxIndex] =
        useState<number | null>(null);

    const externalUrl = getExternalUrl(link);

    // Cover first, then uploaded gallery images.
    const images = useMemo<GalleryImage[]>(() => {
        const result: GalleryImage[] = [];

        if (coverUrl) {
            result.push({
                id: 'cover',
                url: coverUrl,
                alt: `${name} cover`,
            });
        }

        const sortedMedia = [...media].sort(
            (a, b) =>
                a.sortOrder - b.sortOrder ||
                a.id - b.id,
        );

        sortedMedia.forEach((item, index) => {
            result.push({
                id: `media-${item.id}`,
                url: item.url,
                alt: `${name} — image ${index + 1}`,
            });
        });

        return result;
    }, [coverUrl, media, name]);

    const total = images.length;
    const hasGallery = media.length > 0;

    const isLightboxOpen =
        lightboxIndex !== null;

    const currentImage =
        lightboxIndex !== null
            ? images[lightboxIndex] ?? null
            : null;

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
    };

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
    }, []);

    const previous = useCallback(() => {
        setLightboxIndex((current) => {
            if (current === null || total <= 1) {
                return current;
            }

            return current === 0
                ? total - 1
                : current - 1;
        });
    }, [total]);

    const next = useCallback(() => {
        setLightboxIndex((current) => {
            if (current === null || total <= 1) {
                return current;
            }

            return current === total - 1
                ? 0
                : current + 1;
        });
    }, [total]);

    // Keyboard navigation.
    useEffect(() => {
        if (!isLightboxOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                previous();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                next();
            }

            if (event.key === 'Escape') {
                closeLightbox();
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [
        isLightboxOpen,
        previous,
        next,
        closeLightbox,
    ]);

    // Disable background scroll during lightbox.
    useEffect(() => {
        if (!isLightboxOpen) return;

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [isLightboxOpen]);

    return (
        <>
            {/* Back */}
            <div className="mb-8 sm:mb-10">
                <Link
                    href="/press"
                    className="text-[11px] uppercase tracking-[0.08em] text-neutral-400 transition-colors duration-200 hover:text-neutral-950"
                >
                    ← Back to Press
                </Link>
            </div>

            {/* Title, details and external link */}
            <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mb-10">
                <h1 className="text-sm font-medium leading-6 text-neutral-950">
                    {name}
                </h1>

                {details && (
                    <>
                        <span
                            aria-hidden="true"
                            className="text-sm text-neutral-950"
                        >
                            |
                        </span>

                        <p className="whitespace-pre-line text-sm leading-6 text-neutral-950">
                            {details}
                        </p>
                    </>
                )}

                {externalUrl && (
                    <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm leading-6 text-neutral-500 transition-colors duration-200 hover:text-neutral-950"
                    >
                        {linkTitle?.trim() || 'Read more'}
                        <span aria-hidden="true">↗</span>
                    </a>
                )}
            </div>

            {/* Cover only, or cover + gallery */}
            {images.length > 0 && (
                <div
                    className={
                        hasGallery
                            ? 'mx-auto grid max-w-4xl grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12'
                            : 'mx-auto max-w-3xl'
                    }
                >
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            aria-label={`Open image ${index + 1} of ${total}`}
                            className="group block w-full cursor-zoom-in text-center"
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                loading={
                                    index === 0 ? 'eager' : 'lazy'
                                }
                                className={
                                    hasGallery
                                        ? 'block h-auto w-full transition-opacity duration-300 group-hover:opacity-90'
                                        : 'mx-auto block h-auto max-h-[75vh] max-w-full object-contain transition-opacity duration-300 group-hover:opacity-90'
                                }
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && currentImage && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${name} image viewer`}
                    className="fixed inset-0 z-[100] bg-black/95"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeLightbox();
                        }
                    }}
                >
                    {/* Close */}
                    <button
                        type="button"
                        onClick={closeLightbox}
                        aria-label="Close image viewer"
                        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center text-2xl font-light text-white/70 transition-colors duration-200 hover:text-white sm:right-7 sm:top-6"
                    >
                        ×
                    </button>

                    {/* Previous */}
                    {total > 1 && (
                        <button
                            type="button"
                            onClick={previous}
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 z-30 flex h-14 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-white/70 transition-colors duration-200 hover:text-white sm:left-6 sm:w-14"
                        >
                            ←
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="flex h-full w-full items-center justify-center px-14 pb-20 pt-16 sm:px-24"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeLightbox();
                            }
                        }}
                    >
                        <img
                            key={currentImage.id}
                            src={currentImage.url}
                            alt={currentImage.alt}
                            className="block max-h-full max-w-full object-contain"
                        />
                    </div>

                    {/* Next */}
                    {total > 1 && (
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 z-30 flex h-14 w-12 -translate-y-1/2 items-center justify-center text-3xl font-light text-white/70 transition-colors duration-200 hover:text-white sm:right-6 sm:w-14"
                        >
                            →
                        </button>
                    )}

                    {/* Bottom information */}
                    <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 px-5 sm:bottom-6 sm:px-8">
                        <div className="grid grid-cols-[60px_1fr_60px] items-center text-[11px] text-white/70">
                            <div className="tabular-nums">
                                {lightboxIndex !== null
                                    ? lightboxIndex + 1
                                    : 0}
                                {' / '}
                                {total}
                            </div>

                            <div className="hidden min-w-0 items-baseline justify-center gap-3 text-center sm:flex">
                                <span className="font-medium text-white">
                                    {name}
                                </span>

                                {details && (
                                    <>
                                        <span className="text-white/70">
                                            |
                                        </span>
                                        <span className="truncate text-white">
                                            {details}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
