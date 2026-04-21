import { teamSource } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { mdxComponents } from '@/lib/mdx-components';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = teamSource.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={Array.isArray(page.data.toc) ? page.data.toc : []} full={page.data.full} lastUpdate={page.data.lastModified}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = teamSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
