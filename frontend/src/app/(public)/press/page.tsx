import PressGrid, { PublicPressEntry } from "@/components/press/PressGrid";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http: //localhost:3001';

export const revalidate = 60;

type PressApiEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    coverUrl: string | null;
    isPublished: boolean;
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
    const data: PressApiEntry[] = await response.json();
    return data
        .filter(
            (entry) =>
                entry.isPublished,
        )
        .map((entry) => ({
            id: entry.id,
            name: entry.name,
            slug: entry.slug,
            details: entry.details,
            coverUrl: entry.coverUrl,
        }));
}
export default async function PressPage() {
    const entries = await getPressEntries();
    return (
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8 sm:pt-14">
            <div className="mb-10">
                <h1 className="text-2xl font-medium tracking-tight text-neutral-950">
                    Press
                </h1>
            </div>

            <PressGrid
                entries={entries}
            />
        </main>
    );
}