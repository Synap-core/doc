'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { SearchDialogRecovery } from './SearchDialogRecovery';
import { SearchProvider } from './SearchProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SearchDialogRecovery />
      <SearchProvider>
        {children}
      </SearchProvider>
    </AuthProvider>
  );
}
