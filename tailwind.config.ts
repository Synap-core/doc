import type { Config } from 'tailwindcss';
import { docsUi } from 'fumadocs-ui/tailwind-plugin';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  plugins: [
    docsUi({
      preset: 'default',
    }),
  ],
};

export default config;