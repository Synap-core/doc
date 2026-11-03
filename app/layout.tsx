import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { siteUrl } from '@/lib/shared';

/*
 * The website's type (synap.live, founder decision 2026-10-05): Geist for headings and body, Geist Mono for code.
 * One family; hierarchy comes from size, weight and tracking. app/globals.css maps these variables onto Tailwind's
 * --font-sans and --font-mono, which Fumadocs uses.
 */
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

const description =
  'Docs for Synap, the open-source data pod: use the apps, self-host a pod, and build on it with the SDK, the Hub REST API and MCP.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Synap Documentation',
    template: '%s — Synap Docs',
  },
  description,
  openGraph: {
    siteName: 'Synap Docs',
    type: 'website',
    title: 'Synap Documentation',
    description,
  },
};

/** The browser chrome on phones takes the page ground of each theme (see app/globals.css). */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0e8d6' },
    { media: '(prefers-color-scheme: dark)', color: '#26211c' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
