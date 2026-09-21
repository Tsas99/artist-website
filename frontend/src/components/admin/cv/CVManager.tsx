'use client';

import {
    type FormEvent,
    useEffect,
    useState,
} from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import CVEntryForm, {
    CV_CATEGORIES,
    type CVFormData,
} from './CVEntryForm';

type CVEntry = {
    id: number;
    year: string;
    title: string;
    details: string | null;
    category: string;
    sortOrder: number;
};

const EMPTY_FORM: CVFormData = {
    year: '',
    title: '',
    details: '',
    category: 'education',
    sortOrder: '0',
};

function getCategoryLabel(
    category: string,
) {
    return (
        CV_CATEGORIES.find(
            (item) =>
                item.value === category,
        )?.label ?? category
    );
}

export default function CVManager() {
    const [entries, setEntries] =
        useState<CVEntry[]>([]);

    const [form, setForm] =
        useState<CVFormData>(EMPTY_FORM);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [message, setMessage] =
        useState('');

    const [error, setError] =
        useState('');

    async function loadEntries() {
        try {
            setError('');

            const response = await adminFetch(
                '/api/admin/cv',
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to load CV entries.',
                );
            }

            const text =
                await response.text();

            const data: CVEntry[] = text
                ? JSON.parse(text)
                : [];

            setEntries(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadEntries();
    }, []);

    function updateForm(
        field: keyof CVFormData,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setError('');
        setMessage('');
    }

    function startEdit(
        entry: CVEntry,
    ) {
        setEditingId(entry.id);

        setForm({
            year: entry.year,
            title: entry.title,
            details:
                entry.details ?? '',
            category: entry.category,
            sortOrder: String(
                entry.sortOrder,
            ),
        });

        setError('');
        setMessage('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!form.year.trim()) {
            setError('Year is required.');
            return;
        }

        if (!form.title.trim()) {
            setError('Title is required.');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            const payload = {
                year: form.year.trim(),
                title: form.title.trim(),
                details:
                    form.details.trim() ||
                    undefined,
                category: form.category,
                sortOrder:
                    Number.parseInt(
                        form.sortOrder || '0',
                        10,
                    ) || 0,
            };

            const isEditing =
                editingId !== null;

            const url = isEditing
                ? `/api/admin/cv/${editingId}`
                : '/api/admin/cv';

            const response =
                await adminFetch(url, {
                    method: isEditing
                        ? 'PATCH'
                        : 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify(
                        payload,
                    ),
                });

            if (!response.ok) {
                throw new Error(
                    isEditing
                        ? 'Failed to update CV entry.'
                        : 'Failed to create CV entry.',
                );
            }

            setForm(EMPTY_FORM);
            setEditingId(null);

            setMessage(
                isEditing
                    ? 'CV entry updated successfully.'
                    : 'CV entry added successfully.',
            );

            await loadEntries();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(
        entry: CVEntry,
    ) {
        const confirmed =
            window.confirm(
                `Delete "${entry.title}"?`,
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(entry.id);
        setError('');
        setMessage('');

        try {
            const response =
                await adminFetch(
                    `/api/admin/cv/${entry.id}`,
                    {
                        method: 'DELETE',
                    },
                );

            if (!response.ok) {
                throw new Error(
                    'Failed to delete CV entry.',
                );
            }

            if (
                editingId === entry.id
            ) {
                setForm(EMPTY_FORM);
                setEditingId(null);
            }

            setMessage(
                'CV entry deleted successfully.',
            );

            await loadEntries();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="mx-auto max-w-5xl p-6 sm:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                    CV
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Add and manage CV entries.
                </p>
            </div>

            <CVEntryForm
                form={form}
                editingId={editingId}
                saving={saving}
                error={error}
                message={message}
                onChange={updateForm}
                onSubmit={handleSubmit}
                onCancelEdit={resetForm}
            />

            <section>
                <h2 className="mb-6 text-lg font-medium text-neutral-950">
                    CV Entries
                </h2>

                {loading ? (
                    <p className="text-sm text-neutral-500">
                        Loading...
                    </p>
                ) : entries.length ===
                    0 ? (
                    <p className="text-sm text-neutral-500">
                        No CV entries yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {entries.map(
                            (entry) => (
                                <article
                                    key={entry.id}
                                    className="flex flex-col gap-4 border-b border-neutral-200 py-5 sm:flex-row sm:items-start sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="text-sm font-medium text-neutral-950">
                                                {entry.year}
                                            </span>

                                            <span className="text-xs uppercase tracking-wider text-neutral-400">
                                                {getCategoryLabel(
                                                    entry.category,
                                                )}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-medium text-neutral-900">
                                            {entry.title}
                                        </h3>

                                        {entry.details && (
                                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-neutral-500">
                                                {
                                                    entry.details
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 gap-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEdit(
                                                    entry,
                                                )
                                            }
                                            className="text-sm text-neutral-600 transition hover:text-neutral-950"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                deletingId ===
                                                entry.id
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    entry,
                                                )
                                            }
                                            className="text-sm text-red-600 transition hover:text-red-800 disabled:opacity-50"
                                        >
                                            {deletingId ===
                                                entry.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}