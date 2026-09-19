export async function adminFetch(
    input: RequestInfo | URL,
    init? : RequestInit,
) {
    const response = await fetch (input, init);
    if (response.status === 401) {
        window.location.replace('/admin/login');

        throw new Error(
            'Your session has expired.',
        );
    }
    return response;
}