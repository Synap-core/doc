import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  // `icon` in meta.json / frontmatter names a lucide-react icon (e.g. "Rocket").
  plugins: [lucideIconsPlugin()],
});

/** Search index source. */
export const source = docsSource;
