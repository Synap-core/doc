import { docs } from '../.source';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  // `icon` in meta.json / frontmatter names a lucide-react icon (e.g. "Rocket").
  icon(name) {
    if (name && name in icons) return createElement(icons[name as keyof typeof icons]);
    return undefined;
  },
});

/** Search index source. */
export const source = docsSource;
