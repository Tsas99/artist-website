
'use client';

import {
    useEffect,
    useRef,
    useState,
} from 'react';

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
    const scrollRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const [activeIndex, setActiveIndex] = useState<number | null>(
        null,
    );

    const [currentSlide, setCurrentSlide] = useState(0);

    const sortedMedia = [...media].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );

    const images = sortedMedia.filter(
        (item) => !isVideo(item),
    );

    function scrollGallery(direction: -1 | 1) {
        const container = scrollRef.current;
        if (!container) return;

        const items = Array.from(
            container.querySelectorAll<HTMLElement>(
                '[data-gallery-item]',
            ),
        );

        if (!items.length) return;

        const targetIndex = Math.max(
            0,
            Math.min(
                Math.max(0, items.length - 3),
                currentSlide + direction,
            ),
        );

        items[targetIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
        });

        setCurrentSlide(targetIndex);
    }

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        function updateCurrentSlide() {
            if (!container) return;

            const items = Array.from(
                container.querySelectorAll<HTMLElement>(
                    '[data-gallery-item]',
                ),
            );

            if (!items.length) return;

            let nearestIndex = 0;
            let nearestDistance = Infinity;

            items.forEach((item, index) => {
                const distance = Math.abs(
                    item.offsetLeft - container.offsetLeft -
                    container.scrollLeft,
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            setCurrentSlide(nearestIndex);
        }

        container.addEventListener('scroll', updateCurrentSlide, {
            passive: true,
        });

        return () => {
            container.removeEventListener(
                'scroll',
                updateCurrentSlide,
            );
        };
    }, [media]);

    useEffect(() => {
        if (activeIndex === null) return;

        previousFocusRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        closeButtonRef.current?.focus();

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
                        : (current - 1 + images.length) %
                        images.length,
                );
            }

            if (event.key === 'Tab') {
                const dialog = document.getElementById(
                    'exhibition-lightbox',
                );

                if (!dialog) return;

                const buttons = Array.from(
                    dialog.querySelectorAll<HTMLButtonElement>(
                        'button:not(:disabled)',
                    ),
                );

                if (!buttons.length) return;

                const first = buttons[0];
                const last = buttons[buttons.length - 1];

                if (
                    event.shiftKey &&
                    document.activeElement === first
                ) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
            previousFocusRef.current?.focus();
        };
    }, [activeIndex !== null, images.length]);

    let imageIndex = -1;

    return (
        <>

            {/* Horizontal Gallery */}
            <section
                aria-label={`${exhibitionName} documentation gallery`}
                className="relative"
            >
                <div className="relative">
                    {/* Scrollable images */}
                    <div
                        ref={scrollRef}
                        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth sm:gap-4"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {sortedMedia.map((item) => {
                            if (isVideo(item)) {
                                return (
                                    <div
                                        key={item.id}
                                        data-gallery-item
                                        className="w-[calc((100%-24px)/3)] shrink-0 snap-start sm:w-[calc((100%-32px)/3)]"
                                    >
                                        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100">
                                            <video
                                                src={item.url}
                                                controls
                                                playsInline
                                                preload="metadata"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            imageIndex += 1;
                            const currentImageIndex = imageIndex;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    data-gallery-item
                                    onClick={() => setActiveIndex(currentImageIndex)}
                                    className="group w-[calc((100%-24px)/3)] shrink-0 snap-start cursor-zoom-in sm:w-[calc((100%-32px)/3)]"
                                    aria-label={`Enlarge ${exhibitionName} image ${currentImageIndex + 1}`}
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
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

                    {/* Previous arrow over gallery */}
                    {sortedMedia.length > 3 && (
                        <>
                            <button
                                type="button"
                                onClick={() => scrollGallery(-1)}
                                disabled={currentSlide === 0}
                                aria-label="Previous gallery item"
                                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-neutral-900 shadow-sm transition hover:bg-white disabled:cursor-default disabled:opacity-30 sm:left-3"
                            >
                                ←
                            </button>

                            {/* Next arrow over gallery */}
                            <button
                                type="button"
                                onClick={() => scrollGallery(1)}
                                disabled={currentSlide >= sortedMedia.length - 3}
                                aria-label="Next gallery item"
                                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-neutral-900 shadow-sm transition hover:bg-white disabled:cursor-default disabled:opacity-30 sm:right-3"
                            >
                                →
                            </button>
                        </>
                    )}
                </div>

                {/* Gallery counter */}
                <div className="mt-4 text-center text-xs tracking-wide text-neutral-400">
                    {String(currentSlide + 1).padStart(2, '0')}
                    {'–'}
                    {String(
                        Math.min(currentSlide + 3, sortedMedia.length),
                    ).padStart(2, '0')}
                    {' / '}
                    {String(sortedMedia.length).padStart(2, '0')}
                </div>
            </section>


            {/* Fullscreen Lightbox */}
            {activeIndex !== null && images[activeIndex] && (
                <div
                    id="exhibition-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Exhibition image viewer"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-12"
                    onClick={() => setActiveIndex(null)}
                >
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={() => setActiveIndex(null)}
                        aria-label="Close image viewer"
                        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white hover:bg-white hover:text-black"
                    >
                        ×
                    </button>

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
                                aria-label="Previous image"
                                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-white sm:left-6"
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
                                aria-label="Next image"
                                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-3xl text-white sm:right-6"
                            >
                                →
                            </button>
                        </>
                    )}

                    <img
                        src={images[activeIndex].url}
                        alt={`${exhibitionName} enlarged installation view`}
                        onClick={(event) => event.stopPropagation()}
                        className="block max-h-[85dvh] max-w-[calc(100vw-72px)] object-contain sm:max-w-[calc(100vw-140px)]"
                    />

                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/60">
                        {activeIndex + 1} / {images.length}
                    </span>
                </div>
            )}
        </>
    );
}
