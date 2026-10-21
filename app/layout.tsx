import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { siteUrl } from '@/lib/shared';

const description =
  'Docs for Synap, the open-source data pod: use the apps, self-host a pod, and build on it with the SDK, the Hub REST API and MCP.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Synap Documentation',
    template: '%s — Synap Docs',
  },
  description,
  icons: { icon: '/logo.png' },
  openGraph: {
    siteName: 'Synap Docs',
    type: 'website',
    title: 'Synap Documentation',
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
