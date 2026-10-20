'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';

/**
 * Renders the operations of a generated Hub REST API page. The playground is off: the description's server is
 * pod-relative (`/api/hub`), so requests sent from this site would go to the docs site, not a pod.
 */
export const OpenAPIPage = createOpenAPIPage({
  playground: { enabled: false },
});
