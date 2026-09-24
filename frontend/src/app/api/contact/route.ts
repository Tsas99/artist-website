const API_URL =
    process.env.API_URL ??
    'http://localhost:3001';

export async function POST(
    request: Request,
) {
    try {
        const body = await request.json();

        const response = await fetch(
            `${API_URL}/contact`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify(body),
                cache: 'no-store',
            },
        );

        const data = await response.json();

        return Response.json(
            data,
            {
                status: response.status,
            },
        );
    } catch (error) {
        console.error(
            'Contact proxy error:',
            error,
        );

        return Response.json(
            {
                success: false,
                message:
                    'Unable to send message.',
            },
            {
                status: 500,
            },
        );
    }
}