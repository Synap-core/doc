import { RootProvider } from 'fumadocs-ui/provider';
import { Providers } from '@/components/Providers';
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
      <body>
        <Providers>
          <RootProvider>{children}</RootProvider>
        </Providers>
      </body>
    </html>
  );
}
