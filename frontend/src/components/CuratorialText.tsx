
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
    text: string;
};

export default function CuratorialText({ text }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const checkOverflow = () => {
            const lineHeight = parseFloat(
                window.getComputedStyle(element).lineHeight,
            );

            const collapsedHeight = lineHeight * 6;

            setIsOverflowing(
                element.scrollHeight > collapsedHeight + 2,
            );
        };

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(element);

        return () => observer.disconnect();
    }, [text]);

    return (
        <div className="max-w-2xl">
            <div
                ref={textRef}
                className="whitespace-pre-line text-justify text-sm leading-7 text-neutral-700 sm:text-base sm:leading-8"
                style={{
                    maxHeight: expanded ? 'none' : '12rem',
                    overflow: expanded ? 'visible' : 'hidden',
                }}
            >
                {text}
            </div>

            {isOverflowing && (
                <button
                    type="button"
                    onClick={() => setExpanded((previous) => !previous)}
                    aria-expanded={expanded}
                    className="mt-5 inline-flex items-center gap-2 border-b border-neutral-300 pb-1 text-xs font-medium uppercase tracking-[0.1em] text-neutral-500 transition-colors duration-300 hover:border-neutral-950 hover:text-neutral-950"
                >
                    {expanded ? 'Read Less' : 'Read More'}
                    <span aria-hidden="true">
                        {expanded ? '↑' : '↓'}
                    </span>
                </button>
            )}
        </div>
    );
}
