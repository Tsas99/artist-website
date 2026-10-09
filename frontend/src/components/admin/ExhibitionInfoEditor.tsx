
'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

export type ExhibitionMedia = {
    id: number;
    url: string;
    publicId: string;
    type: string;
    sortOrder: number;
};

export type Exhibition = {
    id: number;
    name: string;
    slug: string;
    venue: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    curatorialText: string | null;
    coverUrl: string | null;
    coverPublicId: string | null;
    isPublished: boolean;
    media: ExhibitionMedia[];
};

type Props = {
    exhibition: Exhibition;
    onExhibitionChange: (exhibition: Exhibition) => void;
    onError: (message: string) => void;
};

function dateValue(value: string | null) {
    return value ? value.slice(0, 10) : '';
}

export default function ExhibitionInfoEditor({
    exhibition,
    onExhibitionChange,
    onError,
}: Props) {
    const [name, setName] = useState(exhibition.name);
    const [slug, setSlug] = useState(exhibition.slug);
    const [venue, setVenue] = useState(exhibition.venue ?? '');
    const [location, setLocation] = useState(
        exhibition.location ?? '',
    );
    const [startDate, setStartDate] = useState(
        dateValue(exhibition.startDate),
    );
    const [endDate, setEndDate] = useState(
        dateValue(exhibition.endDate),
    );
    const [curatorialText, setCuratorialText] = useState(
        exhibition.curatorialText ?? '',
    );

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    async function handleSave(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!name.trim() || !slug.trim()) {
            onError('Name and slug are required.');
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            onError('End date cannot be before start date.');
            return;
        }

        setSaving(true);
        setSuccess('');
        onError('');

        try {
            const response = await adminFetch(
                `/api/admin/exhibitions/${exhibition.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        slug: slug.trim(),
                        venue: venue.trim(),
                        location: location.trim(),
                        startDate: startDate
                            ? `${startDate}T00:00:00.000Z`
                            : undefined,
                        endDate: endDate
                            ? `${endDate}T00:00:00.000Z`
                            : undefined,
                        curatorialText: curatorialText.trim(),
                    }),
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                const message = data?.message;

                throw new Error(
                    Array.isArray(message)
                        ? message.join(', ')
                        : typeof message === 'string'
                            ? message
                            : 'Failed to save exhibition.',
                );
            }

            const updated: Exhibition = await response.json();

            onExhibitionChange(updated);
            setSuccess('Exhibition information saved.');
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Failed to save exhibition.',
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        'mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900';

    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
            <h2 className="mb-6 text-xl font-semibold text-neutral-950">
                Exhibition Information
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
                <div>
                    <label htmlFor="exhibition-name" className="text-sm font-medium">
                        Exhibition Name *
                    </label>
                    <input
                        id="exhibition-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="exhibition-slug" className="text-sm font-medium">
                        Slug *
                    </label>
                    <input
                        id="exhibition-slug"
                        value={slug}
                        onChange={(event) => setSlug(event.target.value)}
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        className={inputClass}
                        required
                    />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="exhibition-venue" className="text-sm font-medium">
                            Venue
                        </label>
                        <input
                            id="exhibition-venue"
                            value={venue}
                            onChange={(event) => setVenue(event.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="exhibition-location" className="text-sm font-medium">
                            Location
                        </label>
                        <input
                            id="exhibition-location"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="exhibition-start" className="text-sm font-medium">
                            Start Date
                        </label>
                        <input
                            id="exhibition-start"
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="exhibition-end" className="text-sm font-medium">
                            End Date
                        </label>
                        <input
                            id="exhibition-end"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(event) => setEndDate(event.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="exhibition-text" className="text-sm font-medium">
                        Curatorial Text
                    </label>
                    <textarea
                        id="exhibition-text"
                        value={curatorialText}
                        onChange={(event) =>
                            setCuratorialText(event.target.value)
                        }
                        rows={10}
                        className={inputClass}
                    />
                </div>

                {success && (
                    <p role="status" className="text-sm text-green-700">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Information'}
                </button>
            </form>
        </section>
    );
}
