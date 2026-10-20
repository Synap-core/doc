import { createOpenAPI } from 'fumadocs-openapi/server';
import spec from '@/content/reference-data/hub-openapi.json';
import { splitByTag } from './hub-openapi-split.mjs';

/**
 * The Hub REST API description (copied from the backend by scripts/sync-reference.mjs), split into one document per
 * tag so each generated page under content/docs/reference/hub-api/ embeds only its own operations.
 */
const documents = Object.fromEntries(
  [...splitByTag(spec).values()].map(({ schemaId, document }) => [schemaId, document]),
);

export const openapi = createOpenAPI({ input: documents as never });
