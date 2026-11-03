'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { synapCodeThemes } from '@/lib/shiki-themes';

/**
 * Renders the operations of a generated Hub REST API page. The playground is off: the description's server is
 * pod-relative (`/api/hub`), so requests sent from this site would go to the docs site, not a pod.
 * Code samples use the same Synap highlighting as the MDX pages.
 */
export const OpenAPIPage = createOpenAPIPage({
  playground: { enabled: false },
  shikiOptions: { themes: synapCodeThemes },
});
