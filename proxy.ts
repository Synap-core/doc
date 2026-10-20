import { NextResponse, type NextRequest } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

/**
 * Markdown for agents, from the same pages as the HTML:
 *  - `/docs/<page>.md` always returns the page's Markdown;
 *  - `/docs/<page>` with `Accept: text/markdown` (preferred over text/html) returns it too,
 *    with `Vary: Accept` because the URL now has two representations.
 */
const { rewrite: rewriteSuffix } = rewritePath(`${docsRoute}{/*path}.md`, `${docsContentRoute}{/*path}/content.md`);
const { rewrite: rewriteDocs } = rewritePath(`${docsRoute}{/*path}`, `${docsContentRoute}{/*path}/content.md`);

export default function proxy(request: NextRequest) {
  const suffix = rewriteSuffix(request.nextUrl.pathname);
  if (suffix) return NextResponse.rewrite(new URL(suffix, request.nextUrl));

  if (isMarkdownPreferred(request)) {
    const negotiated = rewriteDocs(request.nextUrl.pathname);
    if (negotiated) {
      return NextResponse.rewrite(new URL(negotiated, request.nextUrl), {
        headers: { Vary: 'Accept' },
      });
    }
  }

  // Next.js drops `Vary` on App Router page responses (tested with Next 16.4: neither this proxy
  // nor next.config `headers()` can add it), so the HTML answer goes out without `Vary: Accept`.
  // A shared cache in front of the site must add it for /docs/* (see CLAUDE.md, "Markdown for agents").
  return NextResponse.next();
}

export const config = {
  matcher: ['/docs', '/docs/:path*'],
};
