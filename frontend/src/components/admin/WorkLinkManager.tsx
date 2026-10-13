
'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

type WorkLink = {
    id: number;
    label: string;
    url: string;
    sortOrder: number;
    workId: number;
};

type Props = {
    workId: number;
    initialLinks: WorkLink[];
    onError: (message: string) => void;
};

export default function WorkLinksManager({
    workId,
    initialLinks,
    onError,
}: Props) {
    const [links, setLinks] = useState<WorkLink[]>(
        [...initialLinks].sort(
            (a, b) => a.sortOrder - b.sortOrder,
        ),
    );

    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    async function handleSave() {
        if (!label.trim() || !url.trim()) {
            onError('Link title and URL are required.');
            return;
        }

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(url.trim());
            if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch {
            onError('Please enter a valid http or https URL.');
            return;
        }


        setSaving(true);
        onError('');

        try {

            const editing = editingId !== null;

            const endpoint = editing
                ? `/api/admin/works/${workId}/links/${editingId}`
                : `/api/admin/works/${workId}/links`;

            const response = await adminFetch(endpoint, {
                method: editing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    label: label.trim(),
                    url: parsedUrl.toString(),
                }),
            });


            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                console.error(
                    'Save link failed:',
                    response.status,
                    errorData,
                );

                throw new Error('Failed to save link');
            }

            const saved: WorkLink = await response.json();

            if (editing) {
                setLinks((current) =>
                    current.map((item) =>
                        item.id === saved.id ? saved : item,
                    ),
                );
            } else {
                setLinks((current) => [...current, saved]);
            }

            setLabel('');
            setUrl('');
            setEditingId(null);
        } catch (error) {
            console.error(error);
            onError('Could not save link.');
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(link: WorkLink) {
        setEditingId(link.id);
        setLabel(link.label);
        setUrl(link.url);
    }


    async function handleDelete(linkId: number) {
        if (!window.confirm('Delete this link?')) {
            return;
        }

        setSaving(true);
        onError('');

        try {
            const response = await adminFetch(
                `/api/admin/works/${workId}/links/${linkId}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                console.error(
                    'Delete link failed:',
                    response.status,
                    errorData,
                );

                throw new Error('Failed to delete link');
            }

            setLinks((current) =>
                current.filter((item) => item.id !== linkId),
            );

            if (editingId === linkId) {
                setEditingId(null);
                setLabel('');
                setUrl('');
            }
        } catch (error) {
            console.error(error);
            onError('Could not delete link.');
        } finally {
            setSaving(false);
        }
    }


    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
            <h2 className="text-xl font-semibold text-neutral-950">
                Links
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
                Add external websites, articles, videos, or catalogues.
            </p>

            {links.length > 0 && (
                <div className="mt-6 space-y-3">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-neutral-900">
                                    {link.label}
                                </p>

                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block break-all text-sm text-neutral-500 underline"
                                >
                                    {link.url}
                                </a>
                            </div>

                            <div className="flex shrink-0 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(link)}
                                    disabled={saving}
                                    className="text-sm text-neutral-700 hover:text-black disabled:opacity-50"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(link.id)}
                                    disabled={saving}
                                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Link title
                    </label>

                    <input
                        type="text"
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="e.g. Tokyo Biennale Website"
                        maxLength={200}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        URL
                    </label>

                    <input
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {saving
                            ? 'Saving...'
                            : editingId !== null

                                ? 'Update link'
                                : 'Add link'}
                    </button>

                    {editingId !== null && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setLabel('');
                                setUrl('');
                            }}
                            disabled={saving}
                            className="text-sm text-neutral-500 hover:text-neutral-950"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
