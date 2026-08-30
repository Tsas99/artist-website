'use client';

import { useState } from 'react';

export type Work = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageUrls: string[];
    mediums: string[];
    eventName: string | null;
    theme: string | null;
    place: string | null;
    material: string | null;
    dimensions: string | null;
    year: number | null;
    isPublished: boolean;
};

type EditableField =
    | 'title'
    | 'slug'
    | 'mediums'
    | 'eventName'
    | 'theme'
    | 'place'
    | 'material'
    | 'dimensions'
    | 'year'
    | 'description';

type Props = {
    work: Work;
    onWorkChange: (work: Work) => void;
    onError: (message: string) => void;
};

export default function WorkInfoEditor({
    work,
    onWorkChange,
    onError,
}: Props) {
    const [editingField, setEditingField] =
        useState<EditableField | null>(null);

    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fields: {
        field: EditableField;
        label: string;
        multiline?: boolean;
    }[] = [
            { field: 'title', label: 'Title' },
            { field: 'slug', label: 'Slug' },
            { field: 'mediums', label: 'Medium' },
            { field: 'year', label: 'Year' },
            { field: 'eventName', label: 'Event name' },
            { field: 'theme', label: 'Theme' },
            { field: 'place', label: 'Place' },
            { field: 'material', label: 'Material' },
            { field: 'dimensions', label: 'Dimensions' },
            {
                field: 'description',
                label: 'Description',
                multiline: true,
            },
        ];

    function startEditing(field: EditableField) {
        setEditingField(field);

        if (field === 'mediums') {
            setEditValue(work.mediums.join(', '));
            return;
        }

        if (field === 'year') {
            setEditValue(work.year ? String(work.year) : '');
            return;
        }

        setEditValue(work[field] ?? '');
    }

    function cancelEditing() {
        setEditingField(null);
        setEditValue('');
    }

    function displayValue(field: EditableField) {
        if (field === 'mediums') {
            return work.mediums.length
                ? work.mediums.join(', ')
                : 'Not added';
        }

        if (field === 'year') {
            return work.year ? String(work.year) : 'Not added';
        }

        return work[field] || 'Not added';
    }

    async function saveField(field: EditableField) {
        setIsSaving(true);
        onError('');

        let value: string | number | string[] | null;

        if (field === 'mediums') {
            value = editValue
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        } else if (field === 'year') {
            value = editValue ? Number(editValue) : null;
        } else {
            value = editValue.trim() || null;
        }

        try {
            const response = await fetch(
                `http://localhost:3001/works/${work.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        [field]: value,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update field');
            }

            const updatedWork: Work = await response.json();

            onWorkChange(updatedWork);
            setEditingField(null);
            setEditValue('');
        } catch (error) {
            console.error(error);
            onError('Changes could not be saved.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {fields.map(({ field, label, multiline }, index) => {
                const isEditing = editingField === field;
                const value = displayValue(field);

                return (
                    <div
                        key={field}
                        className={`p-5 sm:p-6 ${index !== fields.length - 1
                                ? 'border-b border-neutral-200'
                                : ''
                            }`}
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                    {label}
                                </p>

                                {isEditing ? (
                                    <div className="mt-3">
                                        {multiline ? (
                                            <textarea
                                                value={editValue}
                                                onChange={(event) =>
                                                    setEditValue(event.target.value)
                                                }
                                                className="min-h-48 w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                                            />
                                        ) : (
                                            <input
                                                type={
                                                    field === 'year'
                                                        ? 'number'
                                                        : 'text'
                                                }
                                                value={editValue}
                                                onChange={(event) =>
                                                    setEditValue(event.target.value)
                                                }
                                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                                            />
                                        )}

                                        {field === 'mediums' && (
                                            <p className="mt-2 text-xs text-neutral-500">
                                                Separate multiple mediums with commas.
                                            </p>
                                        )}

                                        <div className="mt-3 flex gap-2">
                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={() => saveField(field)}
                                                className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={cancelEditing}
                                                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p
                                        className={`mt-2 text-sm leading-7 ${value === 'Not added'
                                                ? 'text-neutral-400'
                                                : 'whitespace-pre-line text-neutral-800'
                                            }`}
                                    >
                                        {value}
                                    </p>
                                )}
                            </div>

                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => startEditing(field)}
                                    className="shrink-0 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}