
'use client';

import Link from 'next/link';

export type PublicPressEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    link: string | null;
    linkTitle?: string | null;
    coverUrl: string | null;
};

type PressGridProps = {
    entries: PublicPressEntry[];
};

function getExternalUrl(value: string | null) {
    if (!value?.trim()) return null;

    try {
        const url = new URL(value.trim());

        return ['http:', 'https:'].includes(url.protocol)
            ? url.toString()
            : null;
    } catch {
        return null;
    }
}

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
            {entries.map((entry) => {
                const internalHref = `/press/${entry.slug}`;
                const externalUrl = getExternalUrl(entry.link);

                return (
                    <article key={entry.id} className="group">
                        <Link
                            href={internalHref}
                            className="block"
                        >
                            <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                                {entry.coverUrl ? (
                                    <img
                                        src={entry.coverUrl}
                                        alt={entry.name}
                                        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-neutral-100" />
                                )}
                            </div>

                            <h2 className="mt-4 text-sm font-medium leading-5 text-neutral-950">
                                {entry.name}
                            </h2>
                        </Link>

                        {entry.details && (
                            <p className="mt-1 whitespace-pre-line text-sm leading-5 text-neutral-950">
                                {entry.details}
                            </p>
                        )}

                        {externalUrl && (
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
                            >
                                {entry.linkTitle?.trim() ||
                                    'Read more'}
                                <span aria-hidden="true">↗</span>
                            </a>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
