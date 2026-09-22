'use client';

import Link from 'next/link';

export type PublicPressEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    coverUrl: string | null;
};

type PressGridProps = {
    entries: PublicPressEntry[];
};

export default function PressGrid({
    entries,
}: PressGridProps) {
    if (entries.length === 0) {
        return (
            <p className="text-sm text-neutral-400">
                No press entries yet.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
                <Link
                    key={entry.id}
                    href={`/press/${entry.slug}`}
                    className="group block"
                >
                    <div className="overflow-hidden">
                        {entry.coverUrl ? (
                            <img
                                src={entry.coverUrl}
                                alt={entry.name}
                                className="h-auto w-full transition-opacity duration-300 group-hover:opacity-90"
                            />
                        ) : (
                            <div className="aspect-[3/4] w-full bg-neutral-100" />
                        )}
                    </div>

                    <div className="mt-3">
                        <h2 className="text-sm font-medium leading-5 text-neutral-950">
                            {entry.name}
                        </h2>

                        {entry.details && (
                            <p className="mt-1 whitespace-pre-line text-sm leading-5 text-neutral-400 transition-colors duration-300 group-hover:text-neutral-950">
                                {entry.details}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}