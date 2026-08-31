import { NextResponse } from 'next/server';

export const config = {
  matcher: '/',
};

function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const idxMarkdown = acceptHeader.indexOf('text/markdown');
  if (idxMarkdown === -1) return false;
  const idxHtml = acceptHeader.indexOf('text/html');
  if (idxHtml === -1) return true;
  return idxMarkdown < idxHtml;
}

export default async function middleware(request) {
  const accept = request.headers.get('accept') || '';

  if (prefersMarkdown(accept)) {
    const mdUrl = new URL('/content/home.md', request.url);
    const mdRes = await fetch(mdUrl);
    const body = await mdRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept, Accept-Encoding',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('Vary', 'Accept');
  return response;
}
