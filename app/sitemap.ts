import type { MetadataRoute } from 'next';
import { docsSource } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

/** Every page of the docs, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    ...docsSource.getPages().map((page) => ({ url: `${siteUrl}${page.url}` })),
  ];
}
