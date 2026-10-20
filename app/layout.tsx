import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: {
    default: 'Synap Documentation',
    template: '%s — Synap Docs',
  },
  description: 'Synap documentation and resources.',
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
