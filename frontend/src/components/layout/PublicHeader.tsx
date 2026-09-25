'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'PROJECTS', href: '/works' },
    { name: 'NEWS', href: '/news' },
    { name: 'ABOUT', href: '/about' },
    { name: 'PRESS', href: '/press' },
    { name: 'CONTACT', href: '/contact' },

];

export default function PublicHeader() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    function isActive(href: string) {
        if (href === '/') {
            return pathname === '/';
        }

        return pathname.startsWith(href);
    }

    return (
        <header className="relative z-50 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <Link
                        href="/"
                        className="text-sm font-medium tracking-[0.14em] text-neutral-950"
                        onClick={() => setMenuOpen(false)}
                    >
                        TSAGAANTSOOJ
                    </Link>

                    {/* Desktop navigation */}
                    <nav
                        className="hidden items-center gap-8 md:flex"
                        aria-label="Main navigation"
                    >
                        {navigation.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-xs tracking-[0.08em] transition ${active
                                        ? 'text-neutral-950'
                                        : 'text-neutral-500 hover:text-neutral-950'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center text-neutral-950 md:hidden"
                        onClick={() => setMenuOpen((current) => !current)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {menuOpen ? (
                            // Close icon
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5 5L19 19M19 5L5 19"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            // Burger icon
                            <svg
                                width="24"
                                height="20"
                                viewBox="0 0 24 20"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2 3H22M2 10H22M2 17H22"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile navigation */}
            {menuOpen && (
                <nav
                    id="mobile-navigation"
                    className="absolute left-0 top-full w-full border-t border-neutral-100 bg-white md:hidden"
                    aria-label="Mobile navigation"
                >
                    <div className="mx-auto flex max-w-7xl flex-col px-4 py-6">
                        {navigation.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`border-b border-neutral-100 py-4 text-sm tracking-[0.08em] transition last:border-b-0 ${active
                                        ? 'text-neutral-950'
                                        : 'text-neutral-500'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </header>
    );
}