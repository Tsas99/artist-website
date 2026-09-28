import PublicHeader from '@/components/layout/PublicHeader';

import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-cormorant',
});
export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={cormorant.variable}>
            <PublicHeader />
            {children}
        </div>
    );
}