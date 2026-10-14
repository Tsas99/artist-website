
import PressGrid, {
    type PublicPressEntry,
} from '@/components/press/PressGrid';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

export const revalidate = 60;

type PressApiEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    link: string | null;
    linkTitle: string | null;
    coverUrl: string | null;
    isPublished: boolean;
    sortOrder?: number;
};

async function getPressEntries(): Promise<
    PublicPressEntry[]
> {
    const response = await fetch(
        `${API_URL}/press`,
        {
            next: {
                revalidate: 60,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to load press entries.',
        );
    }

    const data: PressApiEntry[] =
        await response.json();

    return data
        .filter((entry) => entry.isPublished)
        .sort(
            (a, b) =>
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0) ||
                a.id - b.id,
        )
        .map((entry) => ({
            id: entry.id,
            name: entry.name,
            slug: entry.slug,
            details: entry.details,
            link: entry.link,
            linkTitle: entry.linkTitle ?? null,
            coverUrl: entry.coverUrl,
        }));
}

export default async function PressPage() {
    const entries = await getPressEntries();

    return (
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8 sm:pt-14">
            <PressGrid entries={entries} />
        </main>
    );
}
