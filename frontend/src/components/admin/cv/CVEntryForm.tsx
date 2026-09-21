import type { FormEvent } from 'react';

export type CVFormData = {
    year: string;
    title: string;
    details: string;
    category: string;
    sortOrder: string;
};

export const CV_CATEGORIES = [
    {
        value: 'education',
        label: 'Education',
    },
    {
        value: 'biennale',
        label: 'Biennale',
    },
    {
        value: 'solo_exhibition',
        label: 'Solo Exhibition',
    },
    {
        value: 'selected_exhibition',
        label: 'Selected Exhibition',
    },
    {
        value: 'artist_residency',
        label: 'Artist Residency',
    },
    {
        value: 'award',
        label: 'Award',
    },
    {
        value: 'project',
        label: 'Project',
    },
] as const;

type CVEntryFormProps = {
    form: CVFormData;
    editingId: number | null;
    saving: boolean;
    error: string;
    message: string;
    onChange: (
        field: keyof CVFormData,
        value: string,
    ) => void;
    onSubmit: (
        event: FormEvent<HTMLFormElement>,
    ) => void;
    onCancelEdit: () => void;
};

export default function CVEntryForm({
    form,
    editingId,
    saving,
    error,
    message,
    onChange,
    onSubmit,
    onCancelEdit,
}: CVEntryFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="mb-14 border border-neutral-200 p-5 sm:p-6"
        >
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-neutral-950">
                    {editingId
                        ? 'Edit Entry'
                        : 'Add Entry'}
                </h2>

                {editingId && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="text-sm text-neutral-500 transition hover:text-neutral-950"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="cv-year"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Year
                    </label>

                    <input
                        id="cv-year"
                        type="text"
                        value={form.year}
                        onChange={(event) =>
                            onChange(
                                'year',
                                event.target.value,
                            )
                        }
                        placeholder="2026 or 2024–2025"
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />
                </div>

                <div>
                    <label
                        htmlFor="cv-category"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Category
                    </label>

                    <select
                        id="cv-category"
                        value={form.category}
                        onChange={(event) =>
                            onChange(
                                'category',
                                event.target.value,
                            )
                        }
                        className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    >
                        {CV_CATEGORIES.map(
                            (category) => (
                                <option
                                    key={category.value}
                                    value={category.value}
                                >
                                    {category.label}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label
                        htmlFor="cv-title"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Title
                    </label>

                    <input
                        id="cv-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                            onChange(
                                'title',
                                event.target.value,
                            )
                        }
                        placeholder="Exhibition, residency, award, institution..."
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label
                        htmlFor="cv-details"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Details
                    </label>

                    <textarea
                        id="cv-details"
                        value={form.details}
                        onChange={(event) =>
                            onChange(
                                'details',
                                event.target.value,
                            )
                        }
                        rows={3}
                        placeholder="Venue, curator, city, country, programme details..."
                        className="w-full resize-y border border-neutral-300 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-neutral-950"
                    />
                </div>

                <div>
                    <label
                        htmlFor="cv-sort-order"
                        className="mb-2 block text-sm text-neutral-700"
                    >
                        Sort Order
                    </label>

                    <input
                        id="cv-sort-order"
                        type="number"
                        value={form.sortOrder}
                        onChange={(event) =>
                            onChange(
                                'sortOrder',
                                event.target.value,
                            )
                        }
                        className="w-full border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
                    />

                    <p className="mt-2 text-xs text-neutral-400">
                        Lower numbers appear first.
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-5 text-sm text-red-600">
                    {error}
                </p>
            )}

            {message && (
                <p className="mt-5 text-sm text-neutral-600">
                    {message}
                </p>
            )}

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-neutral-950 px-5 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? 'Saving...'
                        : editingId
                            ? 'Update Entry'
                            : 'Add Entry'}
                </button>
            </div>
        </form>
    );
}