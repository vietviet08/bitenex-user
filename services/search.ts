// =============================================================================
// Semantic Smart Search - API Service
// =============================================================================

import { api } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchType = 'all' | 'food' | 'restaurant';

export interface SemanticSearchResult {
  id: string;
  type: SearchType;
  name: string;
  description: string | null;
  match_score: number;

  // Food-specific
  price: number | null;
  image_url: string | null;
  merchant_id: string | null;
  merchant_name: string | null;

  // Restaurant-specific
  address: string | null;
  average_rating: number | null;
  delivery_fee: number | null;
  estimated_prep_time: number | null;
}

export interface SemanticSearchResponse {
  query: string;
  search_type: SearchType;
  results: SemanticSearchResult[];
  total: number;
  used_fallback: boolean;
}

export interface SemanticSearchParams {
  q: string;
  limit?: number;
  search_type?: SearchType;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Perform a semantic (natural language) search using the Bitenex API.
 *
 * The backend uses OpenAI text-embedding-3-small + pgvector cosine similarity.
 * Falls back to ILIKE keyword search when AI is unavailable (used_fallback=true).
 *
 * @example
 * const res = await semanticSearch({ q: 'Tôi đang ốm muốn ăn gì đó nóng và dễ tiêu' });
 */
export async function semanticSearch(
  params: SemanticSearchParams,
): Promise<SemanticSearchResponse> {
  const { q, limit = 10, search_type = 'all' } = params;

  const response = await api.get<SemanticSearchResponse>('/search/semantic', {
    params: { q, limit, search_type },
  });

  return response.data;
}
