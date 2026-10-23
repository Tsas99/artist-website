
'use client';

import {
    FormEvent,
    useState,
} from 'react';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (isLoading) return;

        setError('');
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await fetch(
                '/api/auth/forgot-password',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(
                        'Too many requests. Please try again later.',
                    );
                }

                throw new Error(
                    'Unable to process your request. Please try again later.',
                );
            }

            setSuccess(true);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    'Something went wrong. Please try again.',
                );
            }
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
                        Forgot password
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-neutral-500">
                        Enter your admin email address.
                        If an account exists, we will send
                        a password reset link.
                    </p>
                </div>

                {success ? (
                    <div>
                        <div
                            role="status"
                            className="border border-neutral-200 px-5 py-5"
                        >
                            <p className="text-sm font-medium text-neutral-950">
                                Check your email
                            </p>

                            <p className="mt-3 text-sm leading-6 text-neutral-500">
                                If an admin account exists for
                                this email, a password reset
                                link will be sent.
                            </p>

                            <p className="mt-3 text-xs leading-5 text-neutral-400">
                                The link expires in 15 minutes.
                                Please check your spam folder
                                if you do not see the email.
                            </p>
                        </div>

                        <Link
                            href="/admin/login"
                            className="mt-8 inline-flex items-center gap-2 text-xs tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-950"
                        >
                            <ArrowLeft
                                size={15}
                                strokeWidth={1.5}
                            />
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm text-neutral-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Enter your email"
                                    className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-950"
                                />
                            </div>

                            {error && (
                                <p
                                    role="alert"
                                    className="text-sm text-red-600"
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-pointer"
                            >
                                {isLoading
                                    ? 'Sending...'
                                    : 'Send reset link'}
                            </button>
                        </form>

                        <Link
                            href="/admin/login"
                            className="mt-8 inline-flex items-center gap-2 text-xs tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-950"
                        >
                            <ArrowLeft
                                size={15}
                                strokeWidth={1.5}
                            />
                            Back to sign in
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}
