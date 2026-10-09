
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import ExhibitionOrderList, {
    type AdminExhibitionListItem,
} from '@/components/admin/ExhibitionOrderList';

async function getExhibitions(): Promise<
    AdminExhibitionListItem[]
> {
    const response = await fetch(
        `${API_URL}/exhibitions`,
        { cache: 'no-store' },
    );

    if (!response.ok) {
        throw new Error('Failed to fetch exhibitions.');
    }

    return response.json();
}

export default async function AdminExhibitionsPage() {
    const exhibitions = await getExhibitions();

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm text-neutral-500">
                            Admin / Exhibitions
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                            Solo Exhibitions
                        </h1>

                        <p className="mt-2 text-sm text-neutral-500">
                            Manage solo exhibitions, posters and documentation.
                        </p>
                    </div>

                    <Link
                        href="/admin/exhibitions/new"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        Add new exhibition
                    </Link>
                </header>

                {exhibitions.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-12 text-center">
                        <p className="text-sm text-neutral-500">
                            No solo exhibitions yet.
                        </p>

                        <Link
                            href="/admin/exhibitions/new"
                            className="mt-4 inline-block text-sm font-medium text-neutral-950 underline underline-offset-4"
                        >
                            Add your first exhibition
                        </Link>
                    </div>
                ) : (
                    <ExhibitionOrderList
                        initialExhibitions={exhibitions}
                    />
                )}
            </div>
        </main>
    );
}
