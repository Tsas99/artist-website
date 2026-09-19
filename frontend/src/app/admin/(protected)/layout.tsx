import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/admin/LogoutButton';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

export default async function ProtectedAdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();

    const token = cookieStore.get(
        'admin_access_token',
    )?.value;

    if (!token) {
        redirect('/admin/login');
    }

    let isAuthenticated = false;

    try {
        const response = await fetch(
            `${API_URL}/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            },
        );

        isAuthenticated = response.ok;
    } catch (error) {
        console.error(
            'Admin session validation failed:',
            error,
        );
    }

    if (!isAuthenticated) {
        redirect('/admin/login');
    }

    return (
        <>
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <span className="text-sm font-semibold text-neutral-950">
                        Artist Admin
                    </span>

                    <LogoutButton />
                </div>
            </header>

            {children}
        </>
    );
}