'use client';

import {
    FormEvent,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const [error, setError] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(
                '/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                },
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Login failed.',
                );
            }

            router.replace('/admin/works');
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Login failed.');
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
                        Sign in
                    </h1>
                </div>

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
                                setEmail(
                                    event.target.value,
                                )
                            }
                            className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-950"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm text-neutral-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-950"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading
                            ? 'Signing in...'
                            : 'Sign in'}
                    </button>
                </form>
            </div>
        </main>
    );
}