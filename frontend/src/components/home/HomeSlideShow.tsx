'use client';

import {
    useEffect,
    useState,
} from 'react';

type HomeMedia = {
    id: number;
    url: string;
    sortOrder: number;
};

type HomeSlideshowProps = {
    images: HomeMedia[];
};

const SLIDE_DURATION = 6000;

export default function HomeSlideshow({
    images,
}: HomeSlideshowProps) {
    const [currentIndex, setCurrentIndex] =
        useState(0);

    useEffect(() => {
        if (images.length <= 1) {
            return;
        }

        const interval =
            window.setInterval(() => {
                setCurrentIndex(
                    (current) =>
                        (current + 1) %
                        images.length,
                );
            }, SLIDE_DURATION);

        return () => {
            window.clearInterval(interval);
        };
    }, [images.length]);

    if (images.length === 0) {
        return null;
    }

    return (
        <div className="relative h-[calc(100svh-80px)] w-full overflow-hidden">
            {images.map(
                (image, index) => (
                    <div
                        key={image.id}
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[1200ms] ease-in-out ${index === currentIndex
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0'
                            }`}
                    >
                        <img
                            src={image.url}
                            alt=""
                            draggable={false}
                            className="max-h-[82%] max-w-[88%] object-contain"
                        />
                    </div>
                ),
            )}
        </div>
    );
}