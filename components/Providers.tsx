'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { SearchDialogRecovery } from './SearchDialogRecovery';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SearchDialogRecovery />
      {children}
    </AuthProvider>
  );
}
