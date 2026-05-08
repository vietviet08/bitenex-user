// =============================================================================
// Review Service — fetches reviews and AI summaries from bitenex-api
// =============================================================================

import { api } from "./api";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface ReviewDto {
    id: string;
    merchant_id: string;
    user_id: string;
    order_id: string | null;
    rating: number;
    comment: string | null;
    reply: string | null;
    reviewer_name: string | null;
    reviewer_avatar: string | null;
    created_at: string;
    updated_at: string;
}

export interface ReviewListDto {
    items: ReviewDto[];
    total: number;
    page: number;
    per_page: number;
    average_rating: number;
    rating_distribution: Record<string, number>; // {"1": 0, "2": 1, "3": 2, "4": 5, "5": 8}
}

export type SentimentType = "positive" | "neutral" | "negative";

export interface ReviewSummaryDto {
    merchant_id: string;
    merchant_name: string;
    total_reviews_analyzed: number;
    average_rating: number;
    overall_sentiment: SentimentType;
    pros: string[];
    cons: string[];
    summary_vi: string;
    is_cached: boolean;
    cached_at: string | null;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchMerchantReviews(
    merchantId: string,
    page = 1,
    perPage = 10,
): Promise<ReviewListDto> {
    const response = await api.get<ReviewListDto>(
        `/merchants/${merchantId}/reviews?page=${page}&per_page=${perPage}`,
    );
    return response.data;
}

export async function fetchReviewAISummary(
    merchantId: string,
    forceRefresh = false,
): Promise<ReviewSummaryDto> {
    const params = forceRefresh ? "?force_refresh=true" : "";
    const response = await api.get<ReviewSummaryDto>(
        `/merchants/${merchantId}/reviews/ai-summary${params}`,
    );
    return response.data;
}
