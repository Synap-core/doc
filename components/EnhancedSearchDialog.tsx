'use client';

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from 'react';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { useOnChange } from 'fumadocs-core/utils/use-on-change';
import { useI18n } from 'fumadocs-ui/provider';
import { SearchDialog, TagsList, type SharedProps } from 'fumadocs-ui/components/dialog/search';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

// Define filter types
interface FilterOptions {
  sections: string[];
  audiences: string[];
  contentTypes: string[];
}

// Default filter options based on Synap documentation structure
const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  sections: ['general', 'architecture', 'integrate', 'start', 'contributing', 'deployment', 'concepts', 'reference'],
  audiences: ['users', 'developers', 'admins', 'internal'],
  contentTypes: ['tutorial', 'reference', 'concept', 'guide', 'api']
};

// Track search analytics
const trackSearchAnalytics = (query: string, filters: any, resultsCount: number) => {
  // In a real implementation, this would send data to analytics service
  console.log('Search Analytics:', {
    query,
    filters,
    resultsCount,
    timestamp: new Date().toISOString()
  });
  
  // Also store in localStorage for basic tracking
  try {
    const searches = JSON.parse(localStorage.getItem('synapSearchAnalytics') || '[]');
    searches.push({
      query,
      filters,
      resultsCount,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 searches
    localStorage.setItem('synapSearchAnalytics', JSON.stringify(searches.slice(-100)));
  } catch (e) {
    console.warn('Failed to store search analytics:', e);
  }
};

// Enhanced search result with metadata for filtering
interface EnhancedSearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  section?: string;
  audience?: string;
  contentType?: string;
  tags?: string[];
  score: number; // Relevance score
}

// Custom search dialog with filtering capabilities
export function EnhancedSearchDialog({
  open,
  onOpenChange,
  footer,
  links,
  search,
  onSearchChange,
  isLoading,
  defaultTag,
  tags,
  api,
  delayMs,
  type = 'fetch',
  allowClear = false,
  hideResults = false,
  results = [],
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
  links?: Array<[string, string]>;
  search: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
  defaultTag?: string;
  tags?: Array<{ name: string; value: string | undefined; props?: React.ComponentPropsWithoutRef<'button'> }>;
  api: string;
  delayMs?: number;
  type?: 'fetch' | 'static' | 'algolia' | 'orama-cloud';
  allowClear?: boolean;
  hideResults?: boolean;
  results?: any[];
}) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);
  const [filters, setFilters] = useState<Partial<FilterOptions>>({});
  const [searchResults, setSearchResults] = useState<EnhancedSearchResult[]>([]);
  const router = useRouter();
  const searchRef = useRef<string>('');
  
  // Use fumadocs search hook
  const { search: fumadocsSearch, setSearch: setFumadocsSearch, query } = useDocsSearch(
    type === 'fetch'
      ? {
          type: 'fetch',
          api,
        }
      : {
          type: 'static',
          from: api,
        },
    locale,
    tag,
    delayMs
  );

  // Sync external search state with internal fumadocs search
  useEffect(() => {
    if (search !== fumadocsSearch) {
      setFumadocsSearch(search);
    }
  }, [search, fumadocsSearch, setFumadocsSearch]);

  useOnChange(defaultTag, (v) => {
    setTag(v);
  });

  // Handle search submission with filtering and ranking
  const handleSearch = useCallback(async (value: string) => {
    searchRef.current = value;
    
    try {
      // Get raw results from fumadocs
      const rawResults = await query.data;
      
      // Process and enhance results with metadata
      const enhancedResults = await enhanceSearchResults(rawResults as any[], value, filters);
      
      // Apply filters
      const filteredResults = applyFilters(enhancedResults, filters);
      
      // Sort by relevance score
      const sortedResults = [...filteredResults].sort((a, b) => b.score - a.score);
      
      // Update state
      setSearchResults(sortedResults);
      
      // Track analytics
      trackSearchAnalytics(value, filters, sortedResults.length);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, [query, filters]);

  // Enhanced search results with metadata extraction and scoring
  const enhanceSearchResults = useCallback(async (
    rawResults: any[],
    query: string,
    filters: Partial<FilterOptions>
  ): Promise<EnhancedSearchResult[]> => {
    return Promise.all(
      rawResults.map(async (result: any) => {
        // Extract metadata from result
        const metadata = extractMetadata(result);
        
        // Calculate relevance score
        const score = calculateRelevanceScore(result, query, metadata);
        
        return {
          id: result.id || result._id || Math.random().toString(36).substr(2, 9),
          title: result.title || result.name || 'Untitled',
          description: result.description || result.content?.substring(0, 200) || '',
          url: result.url || result.href || `#`,
          section: metadata.section,
          audience: metadata.audience,
          contentType: metadata.contentType,
          tags: metadata.tags || [],
          score
        };
      })
    );
  }, []);

  // Extract metadata from search result
  const extractMetadata = useCallback((result: any) => {
    const metadata: any = {};
    
    // Extract from frontmatter if available
    if (result.frontmatter) {
      metadata.section = result.frontmatter.section || '';
      metadata.audience = result.frontmatter.audience || '';
      metadata.contentType = result.frontmatter.contentType || '';
      metadata.tags = result.frontmatter.tags || [];
    }
    
    // Extract from file path or URL
    if (!metadata.section && result.url) {
      const pathMatch = result.url.match(/\/docs\/([^\/]+)/);
      if (pathMatch) {
        metadata.section = pathMatch[1];
      }
    }
    
    // Extract from content if needed
    if (!metadata.audience && result.content) {
      const contentLower = result.content.toLowerCase();
      if (contentLower.includes('developer') || contentLower.includes('sdk') || contentLower.includes('api')) {
        metadata.audience = 'developers';
      } else if (contentLower.includes('admin') || contentLower.includes('configuration') || contentLower.includes('setup')) {
        metadata.audience = 'admins';
      } else if (contentLower.includes('internal') || contentLower.includes('team')) {
        metadata.audience = 'internal';
      } else {
        metadata.audience = 'users';
      }
    }
    
    return metadata;
  }, []);

  // Calculate relevance score for search result
  const calculateRelevanceScore = useCallback((
    result: any,
    query: string,
    metadata: any
  ): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = (result.title || result.name || '').toLowerCase();
    const contentLower = (result.content || '').toLowerCase();
    const descriptionLower = (result.description || '').toLowerCase();
    
    // Exact title match gets highest score
    if (titleLower === queryLower) {
      score += 100;
    }
    // Title starts with query
    else if (titleLower.startsWith(queryLower)) {
      score += 80;
    }
    // Title contains query
    else if (titleLower.includes(queryLower)) {
      score += 60;
    }
    
    // Content matches
    if (contentLower.includes(queryLower)) {
      score += 40;
    }
    
    // Description matches
    if (descriptionLower.includes(queryLower)) {
      score += 30;
    }
    
    // Boost score based on content type preferences
    if (metadata.contentType === 'tutorial' && queryLower.includes('how')) {
      score += 20;
    }
    if (metadata.contentType === 'reference' && (queryLower.includes('api') || queryLower.includes('reference'))) {
      score += 20;
    }
    if (metadata.contentType === 'guide' && queryLower.includes('guide')) {
      score += 20;
    }
    
    // Boost for exact section matches
    if (metadata.section && filters.sections && filters.sections.includes(metadata.section)) {
      score += 15;
    }
    
    // Boost for exact audience matches
    if (metadata.audience && filters.audiences && filters.audiences.includes(metadata.audience)) {
      score += 15;
    }
    
    // Boost for exact content type matches
    if (metadata.contentType && filters.contentTypes && filters.contentTypes.includes(metadata.contentType)) {
      score += 15;
    }
    

    
    return score;
  }, []);

  // Apply filters to search results
  const applyFilters = useCallback((
    results: EnhancedSearchResult[],
    filterState: Partial<FilterOptions>
  ): EnhancedSearchResult[] => {
    if (!filterState || Object.keys(filterState).length === 0) {
      return results;
    }
    
    return results.filter(result => {
      // Section filter
      if (filterState.sections && filterState.sections.length > 0) {
        if (!result.section || !filterState.sections.includes(result.section)) {
          return false;
        }
      }
      
      // Audience filter
      if (filterState.audiences && filterState.audiences.length > 0) {
        if (!result.audience || !filterState.audiences.includes(result.audience)) {
          return false;
        }
      }
      
      // Content type filter
      if (filterState.contentTypes && filterState.contentTypes.length > 0) {
        if (!result.contentType || !filterState.contentTypes.includes(result.contentType)) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

      // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterOptions, value: string | string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (Array.isArray(value)) {
        newFilters[filterType] = value;
      } else {
        // For single values, we need to handle them specially
        switch (filterType) {
          case 'sections':
            newFilters.sections = value ? [value] : [];
            break;
          case 'audiences':
            newFilters.audiences = value ? [value] : [];
            break;
          case 'contentTypes':
            newFilters.contentTypes = value ? [value] : [];
            break;
          // We don't expect other values since filterType is keyof FilterOptions
        }
      }
      return newFilters;
    });
    
    // Re-run search with new filters
    if (searchRef.current) {
      handleSearch(searchRef.current);
    }
  }, [handleSearch]);

  // Render filter UI
  const renderFilters = () => {
    return (
      <div className="space-y-4 mb-6">
            {/* Section Filter */}
        <div>
          <label className="block text-sm font-medium text-fd-muted mb-1">Section</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FILTER_OPTIONS.sections.map(section => (
              <button
                key={`section-${section}`}
                onClick={() => handleFilterChange('sections', section)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  filters.sections?.includes(section) 
                    ? 'text-fd-primary border-fd-primary' 
                    : 'text-fd-muted border-fd-muted'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
        
        {/* Audience Filter */}
        <div>
          <label className="block text-sm font-medium text-fd-muted mb-1">Audience</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FILTER_OPTIONS.audiences.map(audience => (
              <button
                key={`audience-${audience}`}
                onClick={() => handleFilterChange('audiences', audience)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  filters.audiences?.includes(audience) 
                    ? 'text-fd-primary border-fd-primary' 
                    : 'text-fd-muted border-fd-muted'
                }`}
              >
                {audience}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-fd-muted mb-1">Content Type</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FILTER_OPTIONS.contentTypes.map(type => (
              <button
                key={`contentType-${type}`}
                onClick={() => handleFilterChange('contentTypes', type)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  filters.contentTypes?.includes(type) 
                    ? 'text-fd-primary border-fd-primary' 
                    : 'text-fd-muted border-fd-muted'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

    return (
    _jsx(SearchDialog, {
      open: open,
      onOpenChange: onOpenChange,
      links: links,
      search: fumadocsSearch,
      onSearchChange: setFumadocsSearch,
      isLoading: query.isLoading,
      hideResults: hideResults,
      results: searchResults.length > 0 ? searchResults : (query.data ?? []),
      ...props,
      footer: tags ? (
        _jsxs(_Fragment, {
          children: [
            renderFilters(),
            _jsxs(_Fragment, {
              children: [
                _jsx(TagsList, {
                  tag: tag,
                  onTagChange: setTag,
                  items: tags,
                  allowClear: allowClear
                }),
                footer
              ]
            })
          ]
        })
      ) : (
        _jsxs(_Fragment, {
          children: [
            renderFilters(),
            footer
          ]
        })
      )
    })
  );
}