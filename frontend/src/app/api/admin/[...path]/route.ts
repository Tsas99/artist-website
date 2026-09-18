import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

const ALLOWED_PREFIXES = [
  'works',
  'work-media',
  'upload',
];

async function proxyRequest(
  request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  const { path } = await context.params;

  const firstSegment = path[0];

  if (!ALLOWED_PREFIXES.includes(firstSegment)) {
    return NextResponse.json(
      { message: 'Not allowed.' },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();

  const token = cookieStore.get(
    'admin_access_token',
  )?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized.' },
      { status: 401 },
    );
  }

  const incomingUrl = new URL(request.url);

  const backendPath = path
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const backendUrl =
    `${API_URL}/${backendPath}${incomingUrl.search}`;

  const headers = new Headers();

  const contentType = request.headers.get('content-type');

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  );

  const hasBody =
    request.method !== 'GET' &&
    request.method !== 'HEAD';

  const body = hasBody
    ? await request.arrayBuffer()
    : undefined;

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseBody = await response.arrayBuffer();

  const responseContentType =
    response.headers.get('content-type');

  const responseHeaders = new Headers();

  if (responseContentType) {
    responseHeaders.set(
      'Content-Type',
      responseContentType,
    );
  }

  return new NextResponse(responseBody, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ path: string[] }>;
  },
) {
  return proxyRequest(request, context);
}