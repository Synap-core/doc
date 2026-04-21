'use client';

import { useState } from 'react';
import { EnhancedSearchDialog } from './EnhancedSearchDialog';

export function SearchTest() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Enhanced Search</button>
      <EnhancedSearchDialog
        open={open}
        onOpenChange={setOpen}
        search={search}
        onSearchChange={setSearch}
        defaultTag="all"
        tags={[
          { name: 'all', value: undefined },
          { name: 'tutorial', value: 'tutorial' },
          { name: 'reference', value: 'reference' },
          { name: 'guide', value: 'guide' }
        ]}
        api="/api/search"
        delayMs={100}
      />
    </div>
  );
}