'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    async function handleLogout() {
        try {
            setIsLoggingOut(true);

            const response = await fetch(
                '/api/auth/logout',
                {
                    method: 'POST',
                },
            );

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            router.replace('/admin/login');
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsLoggingOut(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-950 disabled:opacity-50"
        >
            {isLoggingOut
                ? 'Logging out...'
                : 'Logout'}
        </button>
    );
}