import { renderOgImage } from '@/lib/og';
import { siteDescription } from '@/lib/shared';

/** The site's social preview image (the home page and every page without its own). Built once, at build time. */
export const dynamic = 'force-static';

export function GET() {
  return renderOgImage({ title: 'Synap documentation', description: siteDescription });
}
