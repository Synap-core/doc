import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';
import {
  AUDIENCES,
  AVAILABILITY,
  PAGE_TYPES,
  STATUSES,
} from './lib/page-meta';

/**
 * Every page carries the same frontmatter; this schema types it for the app
 * (page.data.audience, .availability, …).
 *
 * Enforcement is scripts/check-frontmatter.mjs (same vocabulary, from
 * lib/page-meta.ts), which `npm run build` runs first. Do not rely on this
 * schema alone: fumadocs-mdx 11.10.1 under Next 15 parses the webpack resource
 * query as `{ "?collection": "docs" }`, finds no collection, and skips schema
 * validation entirely (verified 2026-10-20). Re-test after the framework upgrade.
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
);

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
      description: z.string().min(1),
      type: z.enum(PAGE_TYPES),
      audience: z.enum(AUDIENCES),
      availability: z.array(z.enum(AVAILABILITY)).min(1),
      status: z.enum(STATUSES),
      owner: z.string().min(1),
      last_reviewed: isoDate.optional(),
    }),
  },
});

export default defineConfig();
