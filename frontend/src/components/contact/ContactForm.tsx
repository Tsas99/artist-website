'use client';

import {
    FormEvent,
    useState,
} from 'react';

type FormStatus =
    | 'idle'
    | 'sending'
    | 'success'
    | 'error';

export default function ContactForm() {
    const [status, setStatus] =
        useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] =
        useState('');

    async function handleSubmit(

        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setStatus('sending');
        setErrorMessage('');
        const form = event.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(
                formData.get('name') ?? '',
            ).trim(),

            email: String(
                formData.get('email') ?? '',
            ).trim(),

            subject: String(
                formData.get('subject') ?? '',
            ).trim(),

            message: String(
                formData.get('message') ?? '',
            ).trim(),

            website: String(
                formData.get('website') ?? '',
            ).trim(),
        };

        try {
            const response = await fetch(
                '/api/contact',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                if (response.status === 429) {
                    setStatus('error');
                    setErrorMessage(
                        'Too many messages. Please try again later.',
                    );
                    return;
                }

                if (response.status === 400) {
                    setStatus('error');
                    setErrorMessage(
                        'Please check your information and try again.',
                    );
                    return;
                }

                throw new Error(
                    'Failed to send message.',
                );
            }

            setStatus('success');
            form.reset();

        } catch (error) {
            console.error(
                'Contact form error:',
                error,
            );

            setStatus('error');
            setErrorMessage(
                'Something went wrong. Please try again.',
            );
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full"
        >
            <div
                className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
            >
                <label htmlFor="website">
                    Website
                </label>

                <input
                    id="website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>
            <div className="border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Name *"
                    disabled={status === 'sending'}
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950 disabled:opacity-50"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="email"
                    name="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="Email *"
                    disabled={status === 'sending'}
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950 disabled:opacity-50"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="text"
                    name="subject"
                    maxLength={150}
                    placeholder="Subject"
                    disabled={status === 'sending'}
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950 disabled:opacity-50"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <textarea
                    name="message"
                    required
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    placeholder="Message *"
                    disabled={status === 'sending'}
                    className="block min-h-[180px] w-full resize-none bg-transparent px-0 pb-4 pt-2 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-950 disabled:opacity-50 sm:min-h-[220px]"
                />
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
                <div
                    className="text-xs"
                    aria-live="polite"
                >
                    {status === 'success' && (
                        <span className="text-neutral-600">
                            Message sent. Thank you.
                        </span>
                    )}

                    {status === 'error' && (
                        <span
                            role="alert"
                            className="text-neutral-600"
                        >
                            {errorMessage}
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="min-w-[110px] bg-neutral-950 px-7 py-3 text-sm text-white transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {status === 'sending'
                        ? 'Sending...'
                        : 'Send'}
                </button>
            </div>
        </form>
    );
}