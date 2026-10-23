
import {
    NextRequest,
    NextResponse,
} from 'next/server';

export async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json();

        const backendUrl =
            process.env.API_URL ||
            'http://localhost:3001';

        const response = await fetch(
            `${backendUrl.replace(/\/$/, '')}/auth/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                cache: 'no-store',
            },
        );

        const data = await response.json();

        return NextResponse.json(
            data,
            {
                status: response.status,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    'Unable to process your request. Please try again later.',
            },
            {
                status: 500,
            },
        );
    }
}
