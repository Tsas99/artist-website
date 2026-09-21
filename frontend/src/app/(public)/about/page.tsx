import type { Metadata } from 'next';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export const metadata: Metadata = {
    title: 'About',
    description:
        'About contemporary visual artist Tsagaantsooj Erdenechimeg.',
};

type About = {
    id: number;
    artistStatement: string;
    profileImageUrl: string | null;
    profileImagePublicId: string | null;
};

async function getAbout(): Promise<About | null> {
    try {
        const response = await fetch(
            `${API_URL}/about`,
            {
                cache: 'no-store',
            },
        );

        if (!response.ok) {
            return null;
        }

        const text = await response.text();

        if (!text) {
            return null;
        }

        return JSON.parse(text);
    } catch {
        return null;
    }
}

export default async function AboutPage() {
    const about = await getAbout();

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <h1 className="mb-12 text-sm font-medium uppercase tracking-[0.15em] text-neutral-950">
                About
            </h1>

            <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16 lg:gap-24">
                <div>
                    {about?.profileImageUrl && (
                        <img
                            src={about.profileImageUrl}
                            alt="Tsagaantsooj Erdenechimeg"
                            className="h-auto w-full"
                        />
                    )}
                </div>

                <div className="md:pt-1">
                    <h2 className="text-2xl font-medium tracking-tight text-neutral-950 sm:text-3xl">
                        Tsagaantsooj Erdenechimeg
                    </h2>

                    <div className="mt-10">
                        <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                            Artist Statement
                        </h3>

                        {about?.artistStatement ? (
                            <div className="max-w-2xl whitespace-pre-line text-[15px] leading-7 text-neutral-700">
                                {about.artistStatement}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400">
                                Artist statement coming soon.
                            </p>
                        )}
                    </div>

                    <div className="mt-10 border-t border-neutral-200 pt-6">
                        <Link
                            href="/cv"
                            className="inline-flex text-sm font-medium tracking-wide text-neutral-950 transition-opacity hover:opacity-50"
                        >
                            VIEW CV →
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}