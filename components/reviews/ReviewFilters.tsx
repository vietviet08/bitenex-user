import { View, Text, Pressable, ScrollView } from "react-native";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

const WARNING_COLOR = colors.warning as string;

interface ReviewFiltersProps {
    readonly selectedFilter: number | null;
    readonly onFilterChange: (filter: number | null) => void;
}

const FILTERS: { id: number | null; label: string }[] = [
    { id: null, label: "All" },
    { id: 5, label: "5" },
    { id: 4, label: "4" },
    { id: 3, label: "3" },
    { id: 2, label: "2" },
    { id: 1, label: "1" },
];

export const ReviewFilters = memo(function ReviewFilters({
    selectedFilter,
    onFilterChange,
}: ReviewFiltersProps) {
    return (
        <View className="border-b border-neutral-100">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                }}
            >
                {FILTERS.map((filter) => {
                    const isSelected = selectedFilter === filter.id;
                    return (
                        <Pressable
                            key={filter.label}
                            onPress={() => onFilterChange(filter.id)}
                            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                                isSelected ? "bg-primary-500" : "bg-neutral-100"
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    isSelected
                                        ? "text-white"
                                        : "text-neutral-700"
                                }`}
                            >
                                {filter.label}
                            </Text>
                            {filter.id !== null && (
                                <IconSymbol
                                    name="star"
                                    size={14}
                                    color={
                                        isSelected ? "#FFFFFF" : WARNING_COLOR
                                    }
                                    style={{ marginLeft: 2 }}
                                />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
});
