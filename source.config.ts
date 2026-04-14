import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const team = defineDocs({
  dir: 'content/team',
});

export default defineConfig();
