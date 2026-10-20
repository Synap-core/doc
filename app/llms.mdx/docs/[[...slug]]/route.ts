import { docsLlms, docsSource } from '@/lib/source';
import { getPageMarkdownUrl } from '@/lib/shared';
import { notFound } from 'next/navigation';

export const revalidate = false;

/** The Markdown of one page. Public URL: `/docs/<page>.md` (rewritten here by proxy.ts). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  // The last segment is the `content.md` suffix.
  const page = docsSource.getPage(slug?.slice(0, -1));
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
    },
  });
}

export function generateStaticParams() {
  return docsSource.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
