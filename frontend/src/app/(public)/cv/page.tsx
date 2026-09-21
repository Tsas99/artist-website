import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';

export const metadata: Metadata = {
    title: 'CV',
    description:
        'CV of contemporary visual artist Tsagaantsooj Erdenechimeg.',
};

export const revalidate = 60;

type CVEntry = {
    id: number;
    year: string;
    title: string;
    details: string | null;
    category: string;
};

const SECTIONS = [
    {
        category: 'education',
        title: 'Education',
    },
    {
        category: 'biennale',
        title: 'Biennales',
    },
    {
        category: 'award',
        title: 'Awards',
    },
    {
        category: 'artist_residency',
        title: 'Artist Resididencies',
    },
    {
        category: 'solo_exhibition',
        title: 'Solo Exhibitions',
    },
    {
        category: 'selected_exhibition',
        title: 'Selected Exhibitions',
    },
    {
        category: 'project',
        title: 'Projects',
    },
] as const;

async function getCVEntries(): Promise<CVEntry[]> {
    try {
        const response = await fetch(
            `${API_URL}/cv`,
            {
                next: {
                    revalidate: 60,
                },
            },
        );

        if (!response.ok) {
            return [];
        }

        const text = await response.text();

        if (!text) {
            return [];
        }

        const data = JSON.parse(text);

        return Array.isArray(data)
            ? data
            : [];
    } catch {
        return [];
    }
}

function getYearForSorting(year: string) {
    const matches = year.match(/\d{4}/g);

    if (!matches?.length) {
        return 0;
    }

    return Math.max(
        ...matches.map(Number),
    );
}

function groupEntriesByYear(
    entries: CVEntry[],
) {
    const groups = new Map<
        string,
        CVEntry[]
    >();

    for (const entry of entries) {
        const existing =
            groups.get(entry.year);

        if (existing) {
            existing.push(entry);
        } else {
            groups.set(
                entry.year,
                [entry],
            );
        }
    }

    return Array.from(
        groups.entries(),
    );
}

export default async function CVPage() {
    const entries =
        await getCVEntries();

    return (
        <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
            <header className="mb-10">
                <h1 className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-950">
                    CV
                </h1>

                <p className="mt-3 text-xl font-medium tracking-tight text-neutral-950 sm:text-2xl">
                    Tsagaantsooj Erdenechimeg
                </p>
            </header>

            <div className="space-y-9">
                {SECTIONS.map(
                    (section) => {
                        const sectionEntries =
                            entries
                                .filter(
                                    (
                                        entry,
                                    ) =>
                                        entry.category ===
                                        section.category,
                                )
                                .sort(
                                    (
                                        a,
                                        b,
                                    ) => {
                                        const yearDifference =
                                            getYearForSorting(
                                                b.year,
                                            ) -
                                            getYearForSorting(
                                                a.year,
                                            );

                                        if (
                                            yearDifference !==
                                            0
                                        ) {
                                            return yearDifference;
                                        }

                                        return (
                                            a.id -
                                            b.id
                                        );
                                    },
                                );

                        if (
                            sectionEntries.length ===
                            0
                        ) {
                            return null;
                        }

                        const groupedEntries =
                            groupEntriesByYear(
                                sectionEntries,
                            );

                        return (
                            <section
                                key={
                                    section.category
                                }
                                className="border-t border-neutral-200 pt-4"
                            >
                                <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                                    {
                                        section.title
                                    }
                                </h2>

                                <div className="space-y-2.5">
                                    {groupedEntries.map(
                                        ([
                                            year,
                                            yearEntries,
                                        ]) => (
                                            <div
                                                key={
                                                    year
                                                }
                                                className="grid grid-cols-[58px_minmax(0,1fr)] gap-4"
                                            >
                                                <div className="text-[11px] leading-[1.65] text-neutral-500">
                                                    {
                                                        year
                                                    }
                                                </div>

                                                <div className="space-y-1">
                                                    {yearEntries.map(
                                                        (
                                                            entry,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    entry.id
                                                                }
                                                                className="text-[11px] leading-[1.65] text-neutral-800"
                                                            >
                                                                <span className="font-medium text-neutral-900">
                                                                    {
                                                                        entry.title
                                                                    }
                                                                </span>

                                                                {entry.details && (
                                                                    <span className="text-neutral-500">
                                                                        {
                                                                            ' — '
                                                                        }
                                                                        {
                                                                            entry.details
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </section>
                        );
                    },
                )}
            </div>
        </main>
    );
}