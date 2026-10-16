
type NewsItem = {
    id: number;
    title: string;
    slug: string;
    category: string | null;

    date: string | null;
    venue: string | null;
    location: string | null;
    description: string | null;

    posterUrl: string | null;
    posterPublicId: string | null;

    externalLink: string | null;
    isPublished: boolean;

    sortOrder: number;
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

    return news
        .filter((item) => item.isPublished)
        .sort((a, b) => {
            const orderDifference =
                (a.sortOrder ?? 0) -
                (b.sortOrder ?? 0);

            if (orderDifference !== 0) {
                return orderDifference;
            }

            const dateDifference =
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime();

            if (dateDifference !== 0) {
                return dateDifference;
            }

            return b.id - a.id;
        });
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

function getExternalUrl(value: string) {
    try {
        const url = new URL(value);

        if (
            url.protocol !== 'https:' &&
            url.protocol !== 'http:'
        ) {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}

export default async function NewsPage() {
    const news = await getNews();

    return (
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
            {news.length === 0 ? (
                <p className="text-sm text-neutral-950">
                    No news yet.
                </p>
            ) : (
                <div className="space-y-12">
                    {news.map((item) => {
                        const externalUrl = item.externalLink
                            ? getExternalUrl(item.externalLink)
                            : null;

                        return (
                            <article
                                key={item.id}
                                className="grid gap-6 md:grid-cols-[300px_minmax(0,1fr)] md:gap-12"
                            >
                                {/* POSTER */}
                                <div>
                                    {item.posterUrl && (
                                        <img
                                            src={item.posterUrl}
                                            alt={item.title}
                                            className="h-auto w-full object-contain"
                                        />
                                    )}
                                </div>

                                {/* INFORMATION */}
                                <div className="min-w-0 text-neutral-950">
                                    <div className="space-y-1">
                                        {/* CATEGORY */}
                                        {item.category && (
                                            <p className="text-xs uppercase tracking-[0.14em]">
                                                {item.category}
                                            </p>
                                        )}

                                        {/* TITLE */}
                                        <h2 className="text-sm font-medium leading-6">
                                            {item.title}
                                        </h2>
                                        {/* DATE + VENUE + LOCATION */}
                                        {(item.date ||
                                            item.venue ||
                                            item.location) && (
                                                <div className="mt-2 space-y-1 text-xs text-neutral-950">
                                                    {item.date && (
                                                        <p>{item.date}</p>
                                                    )}

                                                    {item.venue && (
                                                        <p>{item.venue}</p>
                                                    )}

                                                    {item.location && (
                                                        <p>{item.location}</p>
                                                    )}
                                                </div>
                                            )}

                                        {/* DESCRIPTION */}
                                        {item.description && (
                                            <p className="max-w-3xl whitespace-pre-line text-sm leading-7">
                                                {item.description}
                                            </p>
                                        )}



                                        {/* EXTERNAL LINK */}
                                        {externalUrl && (
                                            <a
                                                href={externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
                                            >
                                                {getDomain(externalUrl)}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
