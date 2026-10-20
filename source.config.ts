import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import { AUDIENCES, AVAILABILITY, PAGE_TYPES, STATUSES } from './lib/page-meta';

/**
 * Every page carries the same frontmatter. fumadocs-mdx validates each page
 * against this schema when it compiles the page, so `npm run build` (and
 * `npm run dev`) fail on a page with a missing or unknown value, e.g.
 * `type: guide`. The vocabulary lives in lib/page-meta.ts.
 *
 * scripts/check-frontmatter.mjs checks the same rules without a build (plus
 * rules a schema cannot express, such as the six-month review age); CI runs it
 * first because it is fast and reports every page at once.
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
);

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema
      .extend({
        description: z.string().min(1),
        type: z.enum(PAGE_TYPES),
        audience: z.enum(AUDIENCES),
        availability: z.array(z.enum(AVAILABILITY)).min(1),
        status: z.enum(STATUSES),
        owner: z.string().min(1),
        last_reviewed: isoDate.optional(),
        /** Set on generated pages: the repository and ref the page was generated from. */
        generated_from: z.string().min(1).optional(),
      })
      .strict(),
    postprocess: {
      // The Markdown of each page (served at /docs/<page>.md, llms-full.txt and the docs MCP).
      includeProcessedMarkdown: { headingIds: false },
    },
  },
  meta: {
    schema: metaSchema.strict(),
  },
});

export default defineConfig();
