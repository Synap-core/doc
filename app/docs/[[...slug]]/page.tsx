import { docsSource } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { Callout } from 'fumadocs-ui/components/callout';
import { notFound } from 'next/navigation';
import { mdxComponents } from '@/lib/mdx-components';
import { AUDIENCE_LABELS, AVAILABILITY_LABELS } from '@/lib/page-meta';
import type { Metadata } from 'next';

/** YAML turns 2026-10-20 into a Date before the schema sees it; show it as written. */
function formatReviewed(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

interface Props {
  params: Promise<{ slug?: string[] }>;
}

function Badge({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'warn' }) {
  const toneClass =
    tone === 'warn'
      ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
      : 'border-fd-border bg-fd-secondary text-fd-muted-foreground';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const data = page.data;
  const MDX = data.body;
  const reviewed = formatReviewed(data.last_reviewed);

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-1.5" aria-label="Page metadata">
        <Badge>For {AUDIENCE_LABELS[data.audience]}</Badge>
        {data.availability.map((a) => (
          <Badge key={a}>{AVAILABILITY_LABELS[a]}</Badge>
        ))}
        {data.status !== 'current' ? <Badge tone="warn">{data.status}</Badge> : null}
        {reviewed ? <span className="text-xs text-fd-muted-foreground">Reviewed {reviewed}</span> : null}
      </div>
      {data.status === 'beta' && !reviewed ? (
        <Callout type="warn" title="Not yet re-verified">
          This page predates the current docs review and has not been checked against the code yet. Commands, names
          and counts may be out of date. Prefer the pages marked as reviewed.
        </Callout>
      ) : null}
      {data.status === 'deprecated' ? (
        <Callout type="error" title="Deprecated">
          This page describes something that is being retired. Do not build new work on it.
        </Callout>
      ) : null}
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
