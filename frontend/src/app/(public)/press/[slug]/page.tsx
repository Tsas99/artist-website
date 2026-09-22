import PressViewer from '@/components/press/PressViewer';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

type PressMedia = {
    id: number;
    url: string;
    publicId: string;
    sortOrder: number;
    pressId: number;
};

type PressEntry = {
    id: number;
    name: string;
    slug: string;
    details: string | null;
    link: string | null;
    coverUrl: string | null;
    coverPublicId: string | null;
    isPublished: boolean;
    media: PressMedia[];
};

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

async function getPress(
    slug: string,
): Promise<PressEntry | null> {
    const response = await fetch(
        `${API_URL}/press/slug/${encodeURIComponent(slug)}`,
        {
            cache: 'no-store',
        },
    );

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export default async function PressDetailPage(
    props: PageProps,
) {
    const params = await props.params;

    const slug = params.slug;

    if (!slug) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <p>
                    Dynamic slug is missing.
                </p>
            </main>
        );
    }

    const press =
        await getPress(slug);

    if (
        !press ||
        !press.isPublished
    ) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <p>
                    Press entry not found.
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8 sm:pt-10">
            <PressViewer
                name={press.name}
                details={press.details}
                link={press.link}
                coverUrl={press.coverUrl}
                media={press.media ?? []}
            />
        </main>
    );
}