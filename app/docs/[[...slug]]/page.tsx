import { docsSource } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { Callout } from 'fumadocs-ui/components/callout';
import { notFound } from 'next/navigation';
import { mdxComponents } from '@/lib/mdx-components';
import { AUDIENCE_LABELS, AVAILABILITY_LABELS } from '@/lib/page-meta';
import { getPublicMarkdownUrl, gitConfig } from '@/lib/shared';
import { openapi } from '@/lib/openapi';
import { OpenAPIPage } from '@/components/api-page';
import type { Metadata } from 'next';
import type { TOCItemType } from 'fumadocs-core/toc';

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
  const markdownUrl = getPublicMarkdownUrl(page);
  // A generated Hub REST API page has no Markdown headings: its operations' table of contents is in its frontmatter.
  // `full` pages hide "On this page" by default; these list up to dozens of operations, so keep it.
  const openapiToc = data._openapi?.toc as TOCItemType[] | undefined;

  return (
    <DocsPage
      toc={openapiToc ?? data.toc}
      full={data.full}
      tableOfContent={openapiToc?.length ? { enabled: true } : undefined}
    >
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription className="mb-0">{data.description}</DocsDescription>
      <div className="flex flex-wrap items-center gap-1.5" aria-label="Page metadata">
        <Badge>For {AUDIENCE_LABELS[data.audience]}</Badge>
        {data.availability.map((a) => (
          <Badge key={a}>{AVAILABILITY_LABELS[a]}</Badge>
        ))}
        {data.status !== 'current' ? <Badge tone="warn">{data.status}</Badge> : null}
        {reviewed ? <span className="text-xs text-fd-muted-foreground">Reviewed {reviewed}</span> : null}
        {data.generated_from ? (
          <span className="text-xs text-fd-muted-foreground">Generated from {data.generated_from}</span>
        ) : null}
      </div>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
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
        <MDX
          components={{
            ...mdxComponents,
            // Generated Hub REST API pages (content/docs/reference/hub-api) render their operations with this.
            OpenAPIPage: async (props: React.ComponentProps<typeof OpenAPIPage>) => (
              <OpenAPIPage {...await openapi.preloadOpenAPIPage(page)} {...props} />
            ),
          }}
        />
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
    alternates: {
      canonical: page.url,
      types: { 'text/markdown': getPublicMarkdownUrl(page) },
    },
    openGraph: {
      type: 'article',
      siteName: 'Synap Docs',
      title: page.data.title,
      description: page.data.description,
      url: page.url,
    },
  };
}
