// =============================================================================
// useReviewSummary — Custom React hook for AI Review Summarizer
// =============================================================================

import { useCallback, useState } from "react";

import { fetchReviewAISummary, type ReviewSummaryDto } from "@/services/review";

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------

interface UseReviewSummaryState {
    summary: ReviewSummaryDto | null;
    isLoading: boolean;
    error: string | null;
    isFromCache: boolean;
}

interface UseReviewSummaryReturn extends UseReviewSummaryState {
    loadSummary: (merchantId: string, forceRefresh?: boolean) => Promise<void>;
    reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const INITIAL_STATE: UseReviewSummaryState = {
    summary: null,
    isLoading: false,
    error: null,
    isFromCache: false,
};

export function useReviewSummary(): UseReviewSummaryReturn {
    const [state, setState] = useState<UseReviewSummaryState>(INITIAL_STATE);

    const loadSummary = useCallback(
        async (merchantId: string, forceRefresh = false) => {
            if (!merchantId) return;

            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const data = await fetchReviewAISummary(merchantId, forceRefresh);
                setState({
                    summary: data,
                    isLoading: false,
                    error: null,
                    isFromCache: data.is_cached,
                });
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Không thể tải tóm tắt AI";
                setState({
                    summary: null,
                    isLoading: false,
                    error: message,
                    isFromCache: false,
                });
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    return {
        ...state,
        loadSummary,
        reset,
    };
}
