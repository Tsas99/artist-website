'use client';

import { useEffect, useState } from 'react';

type WorkMedia = {
    id: number;
    url: string;
    publicId: string;
    type: 'image' | 'video';
    sortOrder: number;
    workId: number;
};

type WorkGalleryProps = {
    media: WorkMedia[];
    workTitle: string;
};

export default function WorkGallery({
    media,
    workTitle,
}: WorkGalleryProps) {
    const [activeImageIndex, setActiveImageIndex] =
        useState<number | null>(null);

    const images = media.filter(
        (item) => item.type === 'image',
    );

    const activeImage =
        activeImageIndex !== null
            ? images[activeImageIndex]
            : null;

    function closeLightbox() {
        setActiveImageIndex(null);
    }

    function showPreviousImage() {
        if (activeImageIndex === null) {
            return;
        }

        setActiveImageIndex(
            (activeImageIndex - 1 + images.length) %
            images.length,
        );
    }

    function showNextImage() {
        if (activeImageIndex === null) {
            return;
        }

        setActiveImageIndex(
            (activeImageIndex + 1) %
            images.length,
        );
    }

    useEffect(() => {
        if (activeImageIndex === null) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeLightbox();
            }

            if (event.key === 'ArrowLeft') {
                showPreviousImage();
            }

            if (event.key === 'ArrowRight') {
                showNextImage();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [activeImageIndex]);

    if (media.length === 0) {
        return null;
    }

    return (
        <>
            <section className="mt-14 border-t border-neutral-200 pt-10 sm:mt-20 sm:pt-14">
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                    {media.map((item) => {
                        if (item.type === 'video') {
                            return (
                                <div key={item.id}>
                                    <video
                                        src={item.url}
                                        controls
                                        preload="metadata"
                                        className="h-auto w-full"
                                    />
                                </div>
                            );
                        }

                        const imageIndex =
                            images.findIndex(
                                (image) =>
                                    image.id === item.id,
                            );

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    setActiveImageIndex(
                                        imageIndex,
                                    )
                                }
                                className="block w-full cursor-zoom-in text-left"
                                aria-label={`Open ${workTitle} image ${imageIndex + 1}`}
                            >
                                <img
                                    src={item.url}
                                    alt={`${workTitle} detail ${imageIndex + 1}`}
                                    loading="lazy"
                                    className="h-auto w-full"
                                />
                            </button>
                        );
                    })}
                </div>
            </section>

            {activeImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${workTitle} image viewer`}
                    onClick={closeLightbox}
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
                        aria-label="Close image viewer"
                    >
                        ×
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    showPreviousImage();
                                }}
                                className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 sm:left-6"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    showNextImage();
                                }}
                                className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 sm:right-6"
                                aria-label="Next image"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div
                        className="flex h-full w-full items-center justify-center px-4 py-20 sm:px-20 sm:py-16"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <img
                            src={activeImage.url}
                            alt={`${workTitle} enlarged image ${activeImageIndex! + 1}`}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    {images.length > 1 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80">
                            {activeImageIndex! + 1} /{' '}
                            {images.length}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}