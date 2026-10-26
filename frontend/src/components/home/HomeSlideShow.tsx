
'use client';

import { useEffect, useState } from 'react';

type HomeMedia = {
    id: number;
    url: string;
    sortOrder: number;
};

type HomeSlideshowProps = {
    images: HomeMedia[];
};

const SLIDE_DURATION = 5000;
const FADE_DURATION = 2000;

export default function HomeSlideshow({
    images,
}: HomeSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentIndex((current) => {
                setPreviousIndex(current);
                return (current + 1) % images.length;
            });
        }, SLIDE_DURATION);

        return () => window.clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        if (previousIndex === null) return;

        const timeout = window.setTimeout(() => {
            setPreviousIndex(null);
        }, FADE_DURATION);

        return () => window.clearTimeout(timeout);
    }, [previousIndex, currentIndex]);

    if (images.length === 0) return null;

    return (
        <section className="w-full pt-10 pb-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                    {images.map((image, index) => {
                        const isCurrent = index === currentIndex;
                        const isPrevious = index === previousIndex;

                        return (
                            <div
                                key={image.id}
                                aria-hidden={!isCurrent}
                                className={`absolute inset-0 transition-opacity ease-in-out ${isCurrent
                                    ? 'z-20 opacity-100'
                                    : isPrevious
                                        ? 'z-10 opacity-100'
                                        : 'z-0 opacity-0'
                                    }`}
                                style={{
                                    transitionDuration: `${FADE_DURATION}ms`,
                                }}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    draggable={false}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
