
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-fetch';

export default function NewExhibitionPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [venue, setVenue] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [curatorialText, setCuratorialText] =
        useState('');

    const [isSubmitting, setIsSubmitting] =
        useState(false);
    const [error, setError] = useState('');

    function createSlug(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/['’]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function handleNameChange(value: string) {
        setName(value);
        setSlug(createSlug(value));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!name.trim() || !slug.trim()) {
            setError('Exhibition name and slug are required.');
            return;
        }

        if (
            startDate &&
            endDate &&
            endDate < startDate
        ) {
            setError(
                'End date cannot be earlier than start date.',
            );
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await adminFetch(
                '/api/admin/exhibitions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        slug: slug.trim(),
                        venue: venue.trim() || undefined,
                        location: location.trim() || undefined,
                        startDate: startDate
                            ? `${startDate}T00:00:00.000Z`
                            : undefined,
                        endDate: endDate
                            ? `${endDate}T00:00:00.000Z`
                            : undefined,
                        curatorialText:
                            curatorialText.trim() || undefined,
                        isPublished: false,
                    }),
                },
            );

            if (!response.ok) {
                const responseText = await response.text();

                let message = `Exhibition could not be created. (${response.status})`;

                try {
                    const data = JSON.parse(responseText);

                    if (Array.isArray(data.message)) {
                        message = data.message.join(', ');
                    } else if (
                        typeof data.message === 'string'
                    ) {
                        message = data.message;
                    }
                } catch {
                    if (responseText) {
                        message = responseText;
                    }
                }

                if (response.status === 409) {
                    setError(
                        'This slug is already in use. Please choose a different slug.',
                    );
                    return;
                }

                throw new Error(message);
            }

            const createdExhibition: { id: number } =
                await response.json();

            router.push(
                `/admin/exhibitions/${createdExhibition.id}`,
            );
            router.refresh();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Exhibition could not be created.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputClass =
        'mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10';

    const labelClass =
        'text-sm font-medium text-neutral-800';

    return (
        <main className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mb-8">
                    <p className="mb-2 text-sm text-neutral-500">
                        Admin / Exhibitions / New
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                        Add New Exhibition
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Create a solo exhibition as a draft.
                        Posters and documentation can be added
                        after saving.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Exhibition Information
                        </h2>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="name"
                                    className={labelClass}
                                >
                                    Exhibition Title *
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        handleNameChange(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Solo exhibition title"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="slug"
                                    className={labelClass}
                                >
                                    Slug *
                                </label>

                                <input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(event) =>
                                        setSlug(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="solo-exhibition-title"
                                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                    required
                                />

                                <p className="mt-2 text-xs text-neutral-500">
                                    Used in the exhibition page URL.
                                    Use lowercase English letters,
                                    numbers and hyphens.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="venue"
                                    className={labelClass}
                                >
                                    Venue
                                </label>

                                <input
                                    id="venue"
                                    type="text"
                                    value={venue}
                                    onChange={(event) =>
                                        setVenue(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Gallery or museum"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="location"
                                    className={labelClass}
                                >
                                    Location
                                </label>

                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Ulaanbaatar, Mongolia"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="startDate"
                                    className={labelClass}
                                >
                                    Start Date
                                </label>

                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="endDate"
                                    className={labelClass}
                                >
                                    End Date
                                </label>

                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="curatorialText"
                                    className={labelClass}
                                >
                                    Curatorial Text
                                </label>

                                <textarea
                                    id="curatorialText"
                                    value={curatorialText}
                                    onChange={(event) =>
                                        setCuratorialText(
                                            event.target.value,
                                        )
                                    }
                                    className={`${inputClass} min-h-56 resize-y`}
                                    placeholder="Curatorial statement, exhibition concept and introduction..."
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Publication
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            This exhibition will be saved as a
                            draft. You can upload a poster,
                            installation photographs and videos
                            before publishing it.
                        </p>

                        <div className="mt-4 inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                            Draft
                        </div>
                    </section>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
                        <Link
                            href="/admin/exhibitions"
                            aria-disabled={isSubmitting}
                            onClick={(event) => {
                                if (isSubmitting) {
                                    event.preventDefault();
                                }
                            }}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-h-12 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Creating exhibition...'
                                : 'Create Draft Exhibition'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
