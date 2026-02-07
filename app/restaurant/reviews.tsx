import { View } from "react-native";
import { useState, useCallback, useMemo } from "react";

import {
    ReviewsHeader,
    RatingSummary,
    ReviewFilters,
    ReviewsList,
} from "@/components/reviews";

// Mock data
const MOCK_REVIEWS = [
    {
        id: "1",
        userId: "u1",
        userName: "John Smith",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        date: "2024-01-15",
        text: "Amazing food and excellent service! The pasta was cooked to perfection and the tiramisu was divine. Will definitely come back again.",
    },
    {
        id: "2",
        userId: "u2",
        userName: "Emily Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        rating: 4,
        date: "2024-01-10",
        text: "Great atmosphere and tasty dishes. The wait time was a bit long during peak hours but overall a wonderful experience.",
    },
    {
        id: "3",
        userId: "u3",
        userName: "Michael Brown",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        rating: 5,
        date: "2024-01-08",
        text: "Best Italian restaurant in the area! Highly recommend the seafood risotto.",
    },
    {
        id: "4",
        userId: "u4",
        userName: "Sarah Wilson",
        userAvatar: "https://i.pravatar.cc/150?img=4",
        rating: 3,
        date: "2024-01-05",
        text: "Food was decent but portion sizes could be bigger for the price. Service was friendly though.",
    },
    {
        id: "5",
        userId: "u5",
        userName: "David Lee",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        date: "2024-01-02",
        text: "Absolutely fantastic! The homemade pasta is incredible.",
    },
    {
        id: "6",
        userId: "u6",
        userName: "Jessica Taylor",
        userAvatar: "https://i.pravatar.cc/150?img=6",
        rating: 4,
        date: "2023-12-28",
        text: "Lovely cozy restaurant with delicious food. The wine selection is impressive.",
    },
];

export default function ReviewsScreen() {
    const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

    const handleFilterChange = useCallback((filter: number | null) => {
        setSelectedFilter(filter);
    }, []);

    const filteredReviews = useMemo(() => {
        if (selectedFilter === null) return MOCK_REVIEWS;
        return MOCK_REVIEWS.filter((review) => review.rating === selectedFilter);
    }, [selectedFilter]);

    const ratingSummary = useMemo(() => {
        const totalCount = MOCK_REVIEWS.length;
        const sum = MOCK_REVIEWS.reduce((acc, r) => acc + r.rating, 0);
        const average = totalCount > 0 ? sum / totalCount : 0;

        const distribution = [5, 4, 3, 2, 1].map((stars) => {
            const count = MOCK_REVIEWS.filter((r) => r.rating === stars).length;
            return {
                stars,
                count,
                percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
            };
        });

        return { average, totalCount, distribution };
    }, []);

    return (
        <View className="flex-1 bg-white">
            <ReviewsHeader totalCount={ratingSummary.totalCount} />

            <RatingSummary
                average={ratingSummary.average}
                totalCount={ratingSummary.totalCount}
                distribution={ratingSummary.distribution}
            />

            <ReviewFilters
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
            />

            <ReviewsList
                reviews={filteredReviews}
                selectedFilter={selectedFilter}
            />
        </View>
    );
}
