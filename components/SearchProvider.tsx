'use client';

import { SearchProvider as FumadocsSearchProvider } from 'fumadocs-ui/provider';
import { EnhancedSearchDialog } from './EnhancedSearchDialog';

export function SearchProvider(props: any) {
  return (
    <FumadocsSearchProvider
      SearchDialog={EnhancedSearchDialog}
      {...props}
    />
  );
}