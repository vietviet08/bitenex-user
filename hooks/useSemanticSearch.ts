// =============================================================================
// useSemanticSearch — Custom React hook for Semantic Smart Search
// =============================================================================

import { useCallback, useRef, useState } from 'react';

import {
  type SearchType,
  type SemanticSearchResult,
  semanticSearch,
} from '@/services/search';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseSemanticSearchState {
  results: SemanticSearchResult[];
  isLoading: boolean;
  error: string | null;
  usedFallback: boolean;
  lastQuery: string;
}

interface UseSemanticSearchReturn extends UseSemanticSearchState {
  search: (query: string) => void;
  clearResults: () => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useSemanticSearch
 *
 * Manages the full lifecycle of a semantic search:
 * - Debounces user input (400ms)
 * - Calls the Bitenex semantic search API
 * - Exposes results, loading state, error, and fallback indicator
 * - Supports search type toggle: all | food | restaurant
 *
 * @example
 * const { search, results, isLoading, searchType, setSearchType } = useSemanticSearch();
 */
export function useSemanticSearch(
  limit: number = 15,
): UseSemanticSearchReturn {
  const [state, setState] = useState<UseSemanticSearchState>({
    results: [],
    isLoading: false,
    error: null,
    usedFallback: false,
    lastQuery: '',
  });
  const [searchType, setSearchType] = useState<SearchType>('all');

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track latest query to avoid stale closures
  const latestQuery = useRef<string>('');

  const executeSearch = useCallback(
    async (query: string, type: SearchType) => {
      if (query.trim().length < MIN_QUERY_LENGTH) {
        setState((prev) => ({ ...prev, results: [], isLoading: false, error: null }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await semanticSearch({ q: query, limit, search_type: type });

        // Guard: ignore response if a newer query was fired
        if (latestQuery.current !== query) return;

        setState({
          results: response.results,
          isLoading: false,
          error: null,
          usedFallback: response.used_fallback,
          lastQuery: query,
        });
      } catch (err: unknown) {
        if (latestQuery.current !== query) return;
        const message =
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          results: [],
        }));
      }
    },
    [limit],
  );

  const search = useCallback(
    (query: string) => {
      latestQuery.current = query;

      // Clear previous debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (query.trim().length < MIN_QUERY_LENGTH) {
        setState((prev) => ({ ...prev, results: [], isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      debounceTimer.current = setTimeout(() => {
        executeSearch(query, searchType);
      }, DEBOUNCE_MS);
    },
    [executeSearch, searchType],
  );

  const handleSetSearchType = useCallback(
    (type: SearchType) => {
      setSearchType(type);
      // Re-search with new type if there's an active query
      if (state.lastQuery.trim().length >= MIN_QUERY_LENGTH) {
        executeSearch(state.lastQuery, type);
      }
    },
    [executeSearch, state.lastQuery],
  );

  const clearResults = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    latestQuery.current = '';
    setState({
      results: [],
      isLoading: false,
      error: null,
      usedFallback: false,
      lastQuery: '',
    });
  }, []);

  return {
    ...state,
    search,
    clearResults,
    searchType,
    setSearchType: handleSetSearchType,
  };
}
