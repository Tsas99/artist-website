
'use client';

import {
    FormEvent,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

type PasswordFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
    minLength?: number;
};

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
    minLength,
}: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm text-neutral-700"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    autoComplete={autoComplete}
                    minLength={minLength}
                    required
                    className="w-full border border-neutral-300 bg-white px-4 py-3 pr-12 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
                />

                <button
                    type="button"
                    onClick={() =>
                        setVisible((previous) => !previous)
                    }
                    aria-label={
                        visible
                            ? `Hide ${label.toLowerCase()}`
                            : `Show ${label.toLowerCase()}`
                    }
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-4 flex cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-950"
                >
                    {visible ? (
                        <EyeOff size={19} strokeWidth={1.5} />
                    ) : (
                        <Eye size={19} strokeWidth={1.5} />
                    )}
                </button>
            </div>
        </div>
    );
}

export default function AdminSecurityPage() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] =
        useState('');

    const [newPassword, setNewPassword] =
        useState('');

    const [confirmPassword, setConfirmPassword] =
        useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (saving) return;

        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (newPassword.length < 10) {
            setError(
                'New password must contain at least 10 characters.',
            );
            return;
        }

        if (newPassword === currentPassword) {
            setError(
                'New password must be different from your current password.',
            );
            return;
        }

        setSaving(true);

        let passwordUpdated = false;

        try {
            const response = await adminFetch(
                '/api/admin/auth/change-password',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const message = Array.isArray(data.message)
                    ? data.message.join(' ')
                    : data.message;

                throw new Error(
                    message || 'Failed to update password.',
                );
            }

            passwordUpdated = true;

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setSuccess(
                'Password updated successfully. Signing out...',
            );

            const logoutResponse = await fetch(
                '/api/auth/logout',
                {
                    method: 'POST',
                    cache: 'no-store',
                },
            );

            if (!logoutResponse.ok) {
                throw new Error(
                    'Password updated, but automatic logout failed. Please sign out manually.',
                );
            }

            router.replace('/admin/login');
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.',
            );
        } finally {
            if (!passwordUpdated) {
                setSaving(false);
            }
        }
    }


    return (
        <main className="mx-auto max-w-4xl p-6 sm:p-8">
            <div className="mb-10">
                <h1 className="text-3xl font-medium tracking-tight text-neutral-950">
                    Security
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Manage your administrator password.
                </p>
            </div>

            <div className="max-w-xl">
                <h2 className="mb-6 text-sm font-medium text-neutral-950">
                    Change Password
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <PasswordField
                        id="currentPassword"
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        autoComplete="current-password"
                    />

                    <PasswordField
                        id="newPassword"
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        autoComplete="new-password"
                        minLength={10}
                    />

                    <PasswordField
                        id="confirmPassword"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        minLength={10}
                    />

                    <p className="text-xs text-neutral-500">
                        Your new password must contain at least
                        10 characters and be different from
                        your current password.
                    </p>

                    {error && (
                        <p
                            role="alert"
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            role="status"
                            className="text-sm text-neutral-600"
                        >
                            {success}
                        </p>
                    )}

                    <div className="border-t border-neutral-200 pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="cursor-pointer bg-neutral-950 px-6 py-3 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-pointer"
                        >
                            {saving
                                ? 'Updating...'
                                : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
