
'use client';

import { useEffect, useState } from 'react';

type ExhibitionMedia = {
    id: number;
    url: string;
    publicId: string;
    type: string;
    sortOrder: number;
};

type Props = {
    media: ExhibitionMedia[];
    exhibitionName: string;
};

function isVideo(item: ExhibitionMedia): boolean {
    return (
        item.type.toLowerCase().includes('video') ||
        /\.(mp4|webm|mov)(\?|$)/i.test(item.url)
    );
}

export default function ExhibitionGallery({
    media,
    exhibitionName,
}: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(
        null,
    );

    const sortedMedia = [...media].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );

    const images = sortedMedia.filter((item) => !isVideo(item));

    useEffect(() => {
        if (activeIndex === null) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActiveIndex(null);
            }

            if (event.key === 'ArrowRight') {
                setActiveIndex((current) =>
                    current === null
                        ? null
                        : (current + 1) % images.length,
                );
            }

            if (event.key === 'ArrowLeft') {
                setActiveIndex((current) =>
                    current === null
                        ? null
                        : (current - 1 + images.length) % images.length,
                );
            }
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeIndex, images.length]);

    let imageIndex = -1;

    return (
        <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {sortedMedia.map((item) => {
                    if (isVideo(item)) {
                        return (
                            <video
                                key={item.id}
                                src={item.url}
                                controls
                                playsInline
                                preload="metadata"
                                className="block h-auto max-h-[650px] w-full object-contain"
                            />
                        );
                    }

                    imageIndex += 1;
                    const currentImageIndex = imageIndex;

                    return (

                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveIndex(currentImageIndex)}
                            className="group block w-full cursor-zoom-in overflow-hidden"
                            aria-label={`Enlarge ${exhibitionName} image ${currentImageIndex + 1}`}
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                                <img
                                    src={item.url}
                                    alt={`${exhibitionName} installation view ${currentImageIndex + 1}`}
                                    loading="lazy"
                                    className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {activeIndex !== null && images[activeIndex] && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Exhibition image viewer"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-12"
                    onClick={() => setActiveIndex(null)}
                >

                    {/* Lightbox top toolbar */}
                    <div
                        className="absolute top-0 right-0 z-50 p-4 sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveIndex(null)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-2xl leading-none text-white transition-colors duration-200 hover:bg-white hover:text-black"
                            aria-label="Close image viewer"
                        >
                            ×
                        </button>
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActiveIndex(
                                        (activeIndex - 1 + images.length) %
                                        images.length,
                                    );
                                }}
                                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-white/80 transition hover:text-white sm:left-6"
                                aria-label="Previous image"
                            >
                                ←
                            </button>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActiveIndex(
                                        (activeIndex + 1) % images.length,
                                    );
                                }}
                                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-white/80 transition hover:text-white sm:right-6"
                                aria-label="Next image"
                            >
                                →
                            </button>
                        </>
                    )}


                    <img
                        src={images[activeIndex].url}
                        alt={`${exhibitionName} enlarged installation view`}
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            display: 'block',
                            width: 'auto',
                            height: 'auto',
                            maxWidth: 'calc(100vw - 100px)',
                            maxHeight: 'calc(100dvh - 120px)',
                            objectFit: 'contain',
                        }}
                    />


                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/60">
                        {activeIndex + 1} / {images.length}
                    </span>
                </div>
            )}
        </>
    );
}
