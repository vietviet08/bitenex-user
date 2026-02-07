import { View, Text } from "react-native";
import { memo, useCallback } from "react";
import { FlashList } from "@shopify/flash-list";
import { ReviewCard } from "./ReviewCard";

interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    text: string;
}

interface ReviewsListProps {
    readonly reviews: Review[];
    readonly selectedFilter: number | null;
}

function EmptyReviews({
    selectedFilter,
}: {
    readonly selectedFilter: number | null;
}) {
    const filterText = selectedFilter ? `${selectedFilter}-star ` : "";

    return (
        <View className="flex-1 items-center justify-center py-16">
            <Text className="text-5xl mb-4">📝</Text>
            <Text className="text-lg font-semibold text-neutral-900 mb-2">
                No {filterText}reviews yet
            </Text>
            <Text className="text-base text-neutral-500 text-center px-8">
                {selectedFilter === null
                    ? "Be the first to leave a review!"
                    : "Try selecting a different rating filter"}
            </Text>
        </View>
    );
}

export const ReviewsList = memo(function ReviewsList({
    reviews,
    selectedFilter,
}: ReviewsListProps) {
    const keyExtractor = useCallback((item: Review) => item.id, []);

    const renderItem = useCallback(
        ({ item }: { item: Review }) => <ReviewCard review={item} />,
        [],
    );

    if (reviews.length === 0) {
        return <EmptyReviews selectedFilter={selectedFilter} />;
    }

    return (
        <FlashList
            data={reviews}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
        />
    );
});
