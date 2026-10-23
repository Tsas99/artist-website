
'use client';

import {
    FormEvent,
    Suspense,
    useState,
} from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (isLoading || !token) return;

        setError('');

        if (newPassword.length < 10) {
            setError(
                'Password must contain at least 10 characters.',
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                '/api/auth/reset-password',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        newPassword,
                        confirmPassword,
                    }),
                },
            );

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(
                        'Too many requests. Please try again later.',
                    );
                }

                throw new Error(
                    'Unable to reset password. The link may be invalid or expired.',
                );
            }

            setSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm">
                <div className="mb-10">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                        Administration
                    </p>

                    <h1 className="mt-3 text-3xl font-medium tracking-tight text-neutral-950">
                        Reset password
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-neutral-500">
                        Create a new password for your admin account.
                    </p>
                </div>

                {success ? (
                    <div>
                        <div
                            role="status"
                            className="border border-neutral-200 p-5"
                        >
                            <p className="text-sm font-medium text-neutral-950">
                                Password updated successfully.
                            </p>

                            <p className="mt-3 text-sm text-neutral-500">
                                You can now sign in with your new password.
                            </p>
                        </div>

                        <Link
                            href="/admin/login"
                            className="mt-8 inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-950"
                        >
                            <ArrowLeft size={15} />
                            Back to sign in
                        </Link>
                    </div>
                ) : !token ? (
                    <div>
                        <p role="alert" className="text-sm text-red-600">
                            Invalid password reset link.
                        </p>

                        <Link
                            href="/admin/forgot-password"
                            className="mt-6 inline-block text-sm underline"
                        >
                            Request a new link
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="mb-2 block text-sm text-neutral-700"
                            >
                                New password
                            </label>

                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    minLength={10}
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    className="w-full border border-neutral-300 px-4 py-3 pr-12 outline-none focus:border-neutral-950"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    aria-label="Toggle password visibility"
                                    className="absolute inset-y-0 right-4 flex cursor-pointer items-center text-neutral-500 hover:text-neutral-950"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} strokeWidth={1.5} />
                                    ) : (
                                        <Eye size={19} strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm text-neutral-700"
                            >
                                Confirm new password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    className="w-full border border-neutral-300 px-4 py-3 pr-12 outline-none focus:border-neutral-950"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword((value) => !value)
                                    }
                                    aria-label="Toggle confirm password visibility"
                                    className="absolute inset-y-0 right-4 flex cursor-pointer items-center text-neutral-500 hover:text-neutral-950"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={19} strokeWidth={1.5} />
                                    ) : (
                                        <Eye size={19} strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full cursor-pointer bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-pointer"
                        >
                            {isLoading
                                ? 'Resetting password...'
                                : 'Reset password'}
                        </button>

                        <Link
                            href="/admin/login"
                            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-950"
                        >
                            <ArrowLeft size={15} />
                            Back to sign in
                        </Link>
                    </form>
                )}
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="text-sm text-neutral-500">
                    Loading...
                </p>
            </main>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
