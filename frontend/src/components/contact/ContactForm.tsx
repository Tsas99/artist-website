'use client';

import { FormEvent, useState } from 'react';

type FormStatus =
    | 'idle'
    | 'sending'
    | 'success'
    | 'error';

export default function ContactForm() {
    const [status, setStatus] =
        useState<FormStatus>('idle');

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setStatus('sending');

        // Email backend-ийг дараагийн алхамд холбоно.
        setStatus('idle');
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full"
        >
            <div className="border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Name *"
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="Email *"
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="w-full bg-transparent px-0 pb-4 pt-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-950"
                />
            </div>

            <div className="mt-8 border-b border-neutral-400 focus-within:border-neutral-950">
                <textarea
                    name="message"
                    required
                    rows={7}
                    placeholder="Message *"
                    className="block min-h-[180px] w-full resize-none bg-transparent px-0 pb-4 pt-2 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-950 sm:min-h-[220px]"
                />
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
                <div
                    className="text-xs"
                    aria-live="polite"
                >
                    {status === 'success' && (
                        <span className="text-neutral-600">
                            Message sent.
                        </span>
                    )}

                    {status === 'error' && (
                        <span className="text-neutral-600">
                            Something went wrong.
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