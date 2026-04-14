import { docs, team } from '../.source';
import { loader } from 'fumadocs-core/source';

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

/** Search + legacy imports */
export const source = docsSource;

export const teamSource = loader({
  baseUrl: '/team',
  source: team.toFumadocsSource(),
});
