type NewsItem = {
    id: number;
    title: string;
    slug: string;
    category: string | null;

    date: string | null;
    location: string | null;
    description: string | null;

    posterUrl: string | null;
    posterPublicId: string | null;

    externalLink: string | null;
    isPublished: boolean;

    createdAt: string;
    updatedAt: string;
};

const API_URL =
    process.env.API_URL ??
    'http://localhost:3001';

async function getNews(): Promise<NewsItem[]> {
    const response = await fetch(
        `${API_URL}/news`,
        {
            next: {
                revalidate: 60,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Unable to load news.',
        );
    }

    const news =
        (await response.json()) as NewsItem[];

    return news.filter(
        (item) => item.isPublished,
    );
}

function getDomain(url: string) {
    try {
        return new URL(url)
            .hostname
            .replace(/^www\./, '');
    } catch {
        return url;
    }
}

export default async function NewsPage() {
    const news = await getNews();

    return (
        <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 md:py-14">
            <h1 className="mb-10 text-xs uppercase tracking-[0.16em] text-neutral-950">
                News
            </h1>

            {news.length === 0 ? (
                <p className="text-sm text-neutral-950">
                    No news yet.
                </p>
            ) : (
                <div className="space-y-12">
                    {news.map((item) => (
                        <article
                            key={item.id}
                            className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12"
                        >
                            {/* Poster */}
                            <div>
                                {item.posterUrl && (
                                    <img
                                        src={item.posterUrl}
                                        alt={item.title}
                                        className="h-auto w-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Information */}
                            <div className="min-w-0 text-neutral-950">
                                <div className="space-y-1">
                                    {item.category && (
                                        <p className="text-xs uppercase tracking-[0.14em]">
                                            {item.category}
                                        </p>
                                    )}

                                    <h2 className="text-sm font-medium leading-6">
                                        {item.title}
                                    </h2>

                                    {(item.date ||
                                        item.location) && (
                                            <p className="text-sm leading-6">
                                                {[
                                                    item.date,
                                                    item.location,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        )}

                                    {item.description && (
                                        <p className="max-w-3xl whitespace-pre-line text-sm leading-7">
                                            {item.description}
                                        </p>
                                    )}

                                    {item.externalLink && (
                                        <a
                                            href={item.externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
                                        >
                                            {getDomain(
                                                item.externalLink,
                                            )}{' '}

                                        </a>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}