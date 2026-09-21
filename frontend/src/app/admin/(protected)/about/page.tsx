'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

type About = {
    id: number;
    artistStatement: string;
    profileImageUrl: string | null;
    profileImagePublicId: string | null;
};

type UploadedMedia = {
    url: string;
    publicId: string;
    type: 'image' | 'video';
};

export default function AdminAboutPage() {
    const [artistStatement, setArtistStatement] =
        useState('');

    const [profileImageUrl, setProfileImageUrl] =
        useState<string | null>(null);

    const [
        profileImagePublicId,
        setProfileImagePublicId,
    ] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] =
        useState(false);
    const [saving, setSaving] = useState(false);

    const [
        savedProfileImagePublicId,
        setSavedProfileImagePublicId,
    ] = useState<string | null>(null);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadAbout() {
            try {
                const response = await adminFetch(
                    '/api/admin/about',
                );

                if (!response.ok) {
                    throw new Error(
                        'Failed to load About information.',
                    );
                }

                const text = await response.text();

                if (!text) {
                    return;
                }

                const about: About | null = JSON.parse(text);

                if (about) {
                    setArtistStatement(
                        about.artistStatement ?? '',
                    );

                    setProfileImageUrl(
                        about.profileImageUrl ?? null,
                    );

                    setProfileImagePublicId(
                        about.profileImagePublicId ?? null,
                    );
                    setSavedProfileImagePublicId(
                        about.profileImagePublicId ?? null,
                    );
                }
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

        loadAbout();
    }, []);

    async function handleImageChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            event.target.value = '';
            return;
        }

        setUploading(true);
        setError('');
        setMessage('');



        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await adminFetch(
                '/api/admin/upload/media',
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!uploadResponse.ok) {
                throw new Error(
                    'Failed to upload profile image.',
                );
            }

            const uploaded: UploadedMedia =
                await uploadResponse.json();

            if (uploaded.type !== 'image') {
                await adminFetch(
                    '/api/admin/upload/media',
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            publicId: uploaded.publicId,
                            type: uploaded.type,
                        }),
                    },
                );

                throw new Error(
                    'Profile media must be an image.',
                );
            }

            setProfileImageUrl(uploaded.url);
            setProfileImagePublicId(
                uploaded.publicId,
            );



            setMessage(
                'Profile image uploaded. Save changes to update About.',
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Image upload failed.',
            );
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const oldPublicId =
                savedProfileImagePublicId;

            const response = await adminFetch(
                '/api/admin/about',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        artistStatement,
                        profileImageUrl,
                        profileImagePublicId,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    'Failed to save About information.',
                );
            }

            setSavedProfileImagePublicId(
                profileImagePublicId,
            );

            if (
                oldPublicId &&
                oldPublicId !== profileImagePublicId
            ) {
                const deleteResponse = await adminFetch(
                    '/api/admin/upload/media',
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            publicId: oldPublicId,
                            type: 'image',
                        }),
                    },
                );

                if (!deleteResponse.ok) {
                    console.error(
                        'Old profile image could not be deleted.',
                    );
                }
            }

            setMessage(
                'About updated successfully.',
            );
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
    if (loading) {
        return (
            <div className="p-8 text-sm text-neutral-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-6 sm:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                    About
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Manage your profile image and artist
                    statement.
                </p>
            </div>

            <div className="space-y-10">
                <section>
                    <h2 className="mb-4 text-sm font-medium text-neutral-950">
                        Profile Image
                    </h2>

                    {profileImageUrl && (
                        <div className="mb-5 max-w-sm">
                            <img
                                src={profileImageUrl}
                                alt="Current profile"
                                className="h-auto w-full"
                            />
                        </div>
                    )}

                    <label className="inline-flex cursor-pointer items-center border border-neutral-300 px-4 py-2 text-sm text-neutral-800 transition hover:border-neutral-950">
                        {uploading
                            ? 'Uploading...'
                            : profileImageUrl
                                ? 'Change Image'
                                : 'Upload Image'}

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploading || saving}
                            onChange={handleImageChange}
                        />
                    </label>
                </section>

                <section>
                    <label
                        htmlFor="artistStatement"
                        className="mb-4 block text-sm font-medium text-neutral-950"
                    >
                        Artist Statement
                    </label>

                    <textarea
                        id="artistStatement"
                        value={artistStatement}
                        onChange={(event) =>
                            setArtistStatement(
                                event.target.value,
                            )
                        }
                        rows={16}
                        className="w-full resize-y border border-neutral-300 bg-white p-4 text-sm leading-7 text-neutral-900 outline-none transition focus:border-neutral-950"
                        placeholder="Write your artist statement..."
                    />
                </section>

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-sm text-neutral-600">
                        {message}
                    </p>
                )}

                <div className="border-t border-neutral-200 pt-6">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            uploading
                        }
                        className="bg-neutral-950 px-5 py-3 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? 'Saving...'
                            : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}