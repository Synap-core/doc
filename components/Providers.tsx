'use client';

import { ReactNode } from 'react';
import { SearchDialogRecovery } from './SearchDialogRecovery';
import { SearchProvider } from './SearchProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <SearchDialogRecovery />
      <SearchProvider>{children}</SearchProvider>
    </>
  );
}
