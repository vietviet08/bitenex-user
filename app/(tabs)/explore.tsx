// =============================================================================
// Explore Screen — Semantic Smart Search
// =============================================================================
// Cho phép người dùng tìm kiếm món ăn / quán ăn bằng ngôn ngữ tự nhiên.
// Ví dụ: "Tôi đang ốm, muốn ăn gì đó nóng dễ tiêu" hoặc "Quán mở khuya bán đồ ăn vặt"
// =============================================================================

import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import type { SemanticSearchResult } from "@/services/search";
import type { SearchType } from "@/services/search";
import { colors } from "@/theme";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEARCH_TYPES: { label: string; value: SearchType }[] = [
    { label: "Tất cả", value: "all" },
    { label: "🍜 Món ăn", value: "food" },
    { label: "🏪 Quán ăn", value: "restaurant" },
];

const QUICK_SUGGESTIONS = [
    "Món nóng dễ tiêu",
    "Quán mở khuya",
    "Đồ ăn vặt",
    "Ít calo healthy",
    "Đồ ăn có vị gừng",
    "Cơm văn phòng",
    "Đồ uống mát lạnh",
    "Ăn sáng nhẹ",
];

const NATURAL_PLACEHOLDERS = [
    "Tôi đang ốm, muốn ăn gì đó nóng...",
    "Tìm quán mở khuya gần đây...",
    "Muốn ăn gì healthy, ít calo...",
    "Tìm đồ ăn vặt ngon quanh đây...",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SearchTypeTabsProps {
    value: SearchType;
    onChange: (type: SearchType) => void;
}

function SearchTypeTabs({ value, onChange }: SearchTypeTabsProps) {
    return (
        <View className="flex-row px-lg gap-x-2 pb-sm">
            {SEARCH_TYPES.map((tab) => {
                const isActive = value === tab.value;
                return (
                    <Pressable
                        key={tab.value}
                        onPress={() => onChange(tab.value)}
                        className={`flex-1 items-center py-sm rounded-full border ${
                            isActive
                                ? "bg-primary-500 border-primary-500"
                                : "bg-transparent border-border-light"
                        }`}
                    >
                        <Text
                            className={`text-sm font-semibold ${
                                isActive ? "text-white" : "text-text-secondary"
                            }`}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

interface QuickSuggestionsProps {
    onSelect: (text: string) => void;
}

function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
    return (
        <View className="px-lg pt-xl">
            <View className="flex-row items-center mb-md">
                <Text className="text-base text-text-tertiary mr-xs">✨</Text>
                <Text className="text-sm font-medium text-text-tertiary">
                    Gợi ý tìm kiếm thông minh
                </Text>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {QUICK_SUGGESTIONS.map((suggestion) => (
                    <TouchableOpacity
                        key={suggestion}
                        onPress={() => onSelect(suggestion)}
                        className="bg-primary-50 border border-primary-200 px-md py-sm rounded-full"
                    >
                        <Text className="text-sm font-medium text-primary-700">
                            {suggestion}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

interface AiBadgeProps {
    usedFallback: boolean;
}

function AiBadge({ usedFallback }: AiBadgeProps) {
    return (
        <View
            className={`flex-row items-center self-start mx-lg mb-sm px-sm py-xs rounded-full ${
                usedFallback ? "bg-neutral-100" : "bg-primary-50"
            }`}
        >
            <Text className="text-xs mr-xs">{usedFallback ? "🔍" : "✨"}</Text>
            <Text
                className={`text-xs font-medium ${
                    usedFallback ? "text-text-tertiary" : "text-primary-600"
                }`}
            >
                {usedFallback ? "Tìm kiếm từ khóa" : "AI Semantic Search"}
            </Text>
        </View>
    );
}

// Score bar visual
function MatchScoreBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color =
        pct >= 80
            ? colors.primary[500]
            : pct >= 60
              ? colors.warning
              : colors.neutral[300];

    return (
        <View className="flex-row items-center mt-xs" style={{ gap: 6 }}>
            <View className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                <View
                    style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: color,
                        borderRadius: 999,
                    }}
                />
            </View>
            <Text className="text-xs text-text-tertiary">{pct}%</Text>
        </View>
    );
}

interface ResultCardProps {
    item: SemanticSearchResult;
}

function ResultCard({ item }: ResultCardProps) {
    const isFood = item.type === "food";
    const router = useRouter();

    const handlePress = () => {
        if (isFood && item.merchant_id) {
            router.push({
                pathname: "/food/[id]",
                params: { id: item.id, merchantId: item.merchant_id },
            });
        } else if (!isFood) {
            router.push(`/restaurant/${item.id}`);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className="flex-row items-start py-md px-lg border-b border-border-light"
        >
            {/* Icon */}
            <View
                className={`w-11 h-11 rounded-xl items-center justify-center mr-md flex-shrink-0 ${
                    isFood ? "bg-secondary-50" : "bg-primary-50"
                }`}
            >
                <Text className="text-xl">{isFood ? "🍜" : "🏪"}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between">
                    <Text
                        className="text-base font-semibold text-text-primary flex-1 mr-sm"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    {/* Type badge */}
                    <View
                        className={`px-xs py-[2px] rounded-full ${
                            isFood ? "bg-secondary-100" : "bg-primary-100"
                        }`}
                    >
                        <Text
                            className={`text-xs font-medium ${isFood ? "text-secondary-700" : "text-primary-700"}`}
                        >
                            {isFood ? "Món ăn" : "Quán ăn"}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {item.description && (
                    <Text
                        className="text-sm text-text-secondary mt-xs"
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                )}

                {/* Meta info */}
                <View
                    className="flex-row items-center mt-xs flex-wrap"
                    style={{ gap: 8 }}
                >
                    {isFood && item.merchant_name && (
                        <Text className="text-xs text-text-tertiary">
                            🏪 {item.merchant_name}
                        </Text>
                    )}
                    {isFood && item.price && (
                        <Text className="text-xs font-medium text-primary-600">
                            {item.price.toLocaleString("vi-VN")} ₫
                        </Text>
                    )}
                    {!isFood &&
                        item.average_rating &&
                        item.average_rating > 0 && (
                            <Text className="text-xs text-text-tertiary">
                                ⭐ {item.average_rating.toFixed(1)}
                            </Text>
                        )}
                    {!isFood && item.delivery_fee !== null && (
                        <Text className="text-xs text-text-tertiary">
                            🛵{" "}
                            {item.delivery_fee === 0
                                ? "Miễn phí"
                                : `${item.delivery_fee.toLocaleString("vi-VN")} ₫`}
                        </Text>
                    )}
                </View>

                {/* Match score */}
                <MatchScoreBar score={item.match_score} />
            </View>

            <IconSymbol
                name="chevron-right"
                size={14}
                color={colors.text.tertiary}
                style={{ marginLeft: 4, marginTop: 4 }}
            />
        </TouchableOpacity>
    );
}

function ResultSkeleton() {
    const opacity = useRef(new Animated.Value(0.3)).current;

    Animated.loop(
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.3,
                duration: 700,
                useNativeDriver: true,
            }),
        ]),
    ).start();

    return (
        <Animated.View style={{ opacity }}>
            {[1, 2, 3, 4].map((i) => (
                <View
                    key={i}
                    className="flex-row items-start px-lg py-md border-b border-border-light"
                >
                    <View className="w-11 h-11 rounded-xl bg-neutral-200 mr-md" />
                    <View className="flex-1">
                        <View className="h-4 bg-neutral-200 rounded-md w-3/4 mb-xs" />
                        <View className="h-3 bg-neutral-100 rounded-md w-full mb-xs" />
                        <View className="h-3 bg-neutral-100 rounded-md w-1/2" />
                    </View>
                </View>
            ))}
        </Animated.View>
    );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
    const {
        results,
        isLoading,
        error,
        usedFallback,
        search,
        clearResults,
        searchType,
        setSearchType,
    } = useSemanticSearch(15);

    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Cycle through placeholder hints
    const [placeholderIndex] = useState(() =>
        Math.floor(Math.random() * NATURAL_PLACEHOLDERS.length),
    );
    const placeholder = NATURAL_PLACEHOLDERS[placeholderIndex];

    const handleTextChange = useCallback(
        (text: string) => {
            setSearchQuery(text);
            if (text.trim().length === 0) {
                clearResults();
            } else {
                search(text);
            }
        },
        [search, clearResults],
    );

    const handleSuggestionPress = useCallback(
        (suggestion: string) => {
            setSearchQuery(suggestion);
            search(suggestion);
            inputRef.current?.blur();
        },
        [search],
    );

    const handleClear = useCallback(() => {
        setSearchQuery("");
        clearResults();
        inputRef.current?.focus();
    }, [clearResults]);

    const isSearching = searchQuery.trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
            {/* ----------------------------------------------------------------- */}
            {/* Search Header                                                       */}
            {/* ----------------------------------------------------------------- */}
            <View className="px-lg pt-md pb-sm border-b border-border-light">
                {/* Title */}
                <View className="flex-row items-center mb-sm">
                    <Text className="text-2xl font-bold text-text-primary flex-1">
                        Khám phá
                    </Text>
                    {!isSearching && (
                        <View className="flex-row items-center bg-primary-50 px-sm py-xs rounded-full">
                            <Text className="text-xs mr-xs">✨</Text>
                            <Text className="text-xs font-medium text-primary-600">
                                AI Search
                            </Text>
                        </View>
                    )}
                </View>

                {/* Search Bar */}
                <View
                    className={`flex-row items-center bg-neutral-100 px-md rounded-xl h-12 ${
                        isFocused
                            ? "border border-primary-400"
                            : "border border-transparent"
                    }`}
                >
                    <IconSymbol
                        name="search"
                        size={18}
                        color={colors.text.tertiary}
                    />
                    <TextInput
                        ref={inputRef}
                        className="flex-1 text-base text-text-primary mx-sm"
                        style={{ paddingVertical: 0 }}
                        placeholder={placeholder}
                        placeholderTextColor={colors.text.tertiary}
                        value={searchQuery}
                        onChangeText={handleTextChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        autoCapitalize="sentences"
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={colors.primary[500]}
                        />
                    )}
                    {!isLoading && searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClear}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <IconSymbol
                                name="cancel"
                                size={18}
                                color={colors.text.tertiary}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search type tabs */}
                {isSearching && (
                    <View className="mt-sm">
                        <SearchTypeTabs
                            value={searchType}
                            onChange={setSearchType}
                        />
                    </View>
                )}
            </View>

            {/* ----------------------------------------------------------------- */}
            {/* Content Area                                                        */}
            {/* ----------------------------------------------------------------- */}
            {!isSearching ? (
                /* Default state: quick suggestions + cuisines */
                <FlatList
                    data={[]}
                    keyExtractor={() => "static"}
                    renderItem={() => null}
                    ListHeaderComponent={() => (
                        <>
                            <QuickSuggestions
                                onSelect={handleSuggestionPress}
                            />

                            {/* Popular Cuisines */}
                            <View className="px-lg pt-xl pb-lg">
                                <Text className="text-xl font-semibold text-text-primary mb-md">
                                    Ẩm thực phổ biến
                                </Text>
                                <View
                                    className="flex-row flex-wrap"
                                    style={{ gap: 12 }}
                                >
                                    {[
                                        { icon: "🇻🇳", name: "Việt Nam" },
                                        { icon: "🇯🇵", name: "Nhật Bản" },
                                        { icon: "🇰🇷", name: "Hàn Quốc" },
                                        { icon: "🇮🇹", name: "Ý" },
                                        { icon: "🇹🇭", name: "Thái Lan" },
                                        { icon: "🇨🇳", name: "Trung Hoa" },
                                    ].map((cuisine) => (
                                        <TouchableOpacity
                                            key={cuisine.name}
                                            onPress={() =>
                                                handleSuggestionPress(
                                                    `Đồ ăn ${cuisine.name}`,
                                                )
                                            }
                                            className="w-[30%] bg-neutral-50 border border-border-light p-lg rounded-xl items-center"
                                        >
                                            <Text className="text-[32px] mb-xs">
                                                {cuisine.icon}
                                            </Text>
                                            <Text className="text-xs font-medium text-text-primary">
                                                {cuisine.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                /* Search results */
                <>
                    {/* AI/Fallback badge + result count */}
                    {!isLoading && results.length > 0 && (
                        <View className="flex-row items-center justify-between px-lg py-sm">
                            <AiBadge usedFallback={usedFallback} />
                            <Text className="text-xs text-text-tertiary">
                                {results.length} kết quả
                            </Text>
                        </View>
                    )}

                    {/* Error state */}
                    {error && !isLoading && (
                        <View className="items-center py-xl px-lg">
                            <Text className="text-4xl mb-md">😕</Text>
                            <Text className="text-base font-semibold text-text-primary mb-xs">
                                Có lỗi xảy ra
                            </Text>
                            <Text className="text-sm text-text-tertiary text-center">
                                {error}
                            </Text>
                        </View>
                    )}

                    {/* Loading skeleton */}
                    {isLoading && <ResultSkeleton />}

                    {/* Result list */}
                    {!isLoading && !error && (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => `${item.type}-${item.id}`}
                            renderItem={({ item }) => (
                                <ResultCard item={item} />
                            )}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={() => (
                                <View className="items-center py-4xl px-lg">
                                    <Text className="text-5xl mb-md">🔍</Text>
                                    <Text className="text-lg font-semibold text-text-primary mb-sm">
                                        Không tìm thấy kết quả
                                    </Text>
                                    <Text className="text-sm text-text-tertiary text-center">
                                        Hãy thử mô tả khác, ví dụ:{"\n"}"Món có
                                        vị ngọt, ít cay"
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </>
            )}
        </SafeAreaView>
    );
}
