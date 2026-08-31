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

// Framework-agnostic Edge Middleware (no Next.js in this project, so
// `next/server` is unavailable — use the standard Web Request/Response APIs).
// Returning `undefined` lets the request continue unmodified to static
// hosting; the Vary header on normal HTML responses is set via vercel.json
// instead, since there is no chained response object to mutate here.
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
}
