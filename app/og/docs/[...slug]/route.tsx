import { notFound } from 'next/navigation';
import { docsSource, getPageImage } from '@/lib/source';
import { renderOgImage } from '@/lib/og';

/**
 * One social preview image per docs page, at `/og/docs/<page>/image.png` (lib/source.ts `getPageImage`): the page's
 * title and description, and the section it is in. Every image is built at build time; any other path is a 404.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = docsSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const section = docsSource
    .getPageTree()
    .children.find((node) => node.type === 'folder' && node.index?.url === `/docs/${page.slugs[0]}`);

  return renderOgImage({
    title: page.data.title,
    description: page.data.description,
    section: section ? String(section.name) : 'Docs',
  });
}

export function generateStaticParams() {
  return docsSource.getPages().map((page) => ({ slug: getPageImage(page).segments }));
}
