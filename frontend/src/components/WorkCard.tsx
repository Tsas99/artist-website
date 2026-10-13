
'use client';

import Link from 'next/link';
import { useState } from 'react';

type Work = {
    id: number;
    title: string;
    slug: string;
    imageUrl: string | null;
    mediums: string[];
};

export default function WorkCard({ work }: { work: Work }) {
    const [active, setActive] = useState(false);

    return (
        <article className="group">
            <Link
                href={`/works/${work.slug}`}
                className="block"
                onClick={(event) => {
                    if (
                        window.matchMedia('(hover: none)').matches &&
                        !active
                    ) {
                        event.preventDefault();
                        setActive(true);
                    }
                }}
            >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {work.imageUrl ? (
                        <>
                            <img
                                src={work.imageUrl}
                                alt={work.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />

                            {/* Desktop hover / Mobile tap */}
                            <div className="pointer-events-none absolute inset-0 flex items-end p-5">
                                <div
                                    className={`transition-all duration-300 ${active
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-2 opacity-0'
                                        } group-hover:translate-y-0 group-hover:opacity-100`}
                                >
                                    <h2 className="font-display text-lg text-white">
                                        {work.title}
                                    </h2>

                                    {work.mediums.length > 0 && (
                                        <p className="mt-1 font-display text-sm text-white/75">
                                            {work.mediums.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                            No image
                        </div>
                    )}
                </div>
            </Link>
        </article>
    );
}
