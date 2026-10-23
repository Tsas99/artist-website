
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigation = [
    {
        label: 'HOME',
        href: '/admin/home',
    },
    {
        label: 'PROJECTS',
        href: '/admin/works',
    },
    {
        label: 'EXHIBITIONS',
        href: '/admin/exhibitions',
    },
    {
        label: 'NEWS',
        href: '/admin/news',
    },
    {
        label: 'ABOUT',
        href: '/admin/about',
    },
    {
        label: 'CV',
        href: '/admin/cv',
    },
    {
        label: 'PRESS',
        href: '/admin/press',
    },
    {
        label: 'SECURITY',
        href: '/admin/security',
    },
];

export default function AdminNavigation() {
    const pathname = usePathname();
    const router = useRouter();

    const [menuOpen, setMenuOpen] =
        useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        document.body.style.overflow =
            'hidden';

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );

            document.body.style.overflow =
                '';
        };
    }, [menuOpen]);

    function isActive(href: string) {
        return (
            pathname === href ||
            pathname.startsWith(
                `${href}/`,
            )
        );
    }

    async function handleLogout() {
        try {
            await fetch(
                '/api/auth/logout',
                {
                    method: 'POST',
                },
            );
        } finally {
            router.replace(
                '/admin/login',
            );
            router.refresh();
        }
    }

    const navLinks = (
        <nav className="space-y-1">
            {navigation.map((item) => {
                const active =
                    isActive(
                        item.href,
                    );

                return (
                    <Link
                        key={
                            item.href
                        }
                        href={
                            item.href
                        }
                        className={`block py-2 text-xs tracking-[0.12em] transition-opacity ${active
                            ? 'font-medium text-neutral-950'
                            : 'text-neutral-500 hover:text-neutral-950'
                            }`}
                    >
                        {
                            item.label
                        }
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-neutral-200 bg-white md:flex md:flex-col">
                <div className="flex h-full flex-col px-8 py-10">
                    <Link
                        href="/admin/home"
                        className="text-xs font-medium tracking-[0.16em] text-neutral-950"
                    >
                        ADMIN
                    </Link>

                    <div className="mt-12">
                        {navLinks}
                    </div>

                    <div className="mt-auto space-y-1 border-t border-neutral-200 pt-6">
                        <Link
                            href="/"
                            target="_blank"
                            className="block py-2 text-xs tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-950"
                        >
                            VIEW WEBSITE ↗
                        </Link>

                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="block w-full py-2 text-left text-xs tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-950"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-5 md:hidden">
                <Link
                    href="/admin/home"
                    className="text-xs font-medium tracking-[0.16em] text-neutral-950"
                >
                    ADMIN
                </Link>

                <button
                    type="button"
                    aria-label={
                        menuOpen
                            ? 'Close menu'
                            : 'Open menu'
                    }
                    aria-expanded={
                        menuOpen
                    }
                    onClick={() =>
                        setMenuOpen(
                            (current) =>
                                !current,
                        )
                    }
                    className="flex h-10 w-10 flex-col items-end justify-center gap-[5px]"
                >
                    <span
                        className={`block h-px bg-neutral-950 transition-all duration-300 ${menuOpen
                            ? 'w-5 translate-y-[6px] rotate-45'
                            : 'w-5'
                            }`}
                    />

                    <span
                        className={`block h-px w-5 bg-neutral-950 transition-opacity duration-300 ${menuOpen
                            ? 'opacity-0'
                            : 'opacity-100'
                            }`}
                    />

                    <span
                        className={`block h-px bg-neutral-950 transition-all duration-300 ${menuOpen
                            ? 'w-5 -translate-y-[6px] -rotate-45'
                            : 'w-5'
                            }`}
                    />
                </button>
            </header>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="fixed inset-x-0 bottom-0 top-16 z-30 bg-white md:hidden">
                    <div className="flex h-full flex-col px-6 py-8">
                        {navLinks}

                        <div className="mt-auto space-y-1 border-t border-neutral-200 pt-6">
                            <Link
                                href="/"
                                target="_blank"
                                className="block py-2 text-xs tracking-[0.12em] text-neutral-500"
                            >
                                VIEW WEBSITE ↗
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className="block w-full py-2 text-left text-xs tracking-[0.12em] text-neutral-500"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}