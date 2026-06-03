// =============================================================================
// ReviewSummaryCard — AI-powered review summary for restaurant detail screen
// =============================================================================
// Displays LLM-generated pros/cons with animations, skeleton loading,
// and overall sentiment indicator.
// =============================================================================

import { useEffect, useRef } from "react";
import {
    Animated,
    type DimensionValue,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { type ReviewSummaryDto, type SentimentType } from "@/services/review";
import { colors } from "@/theme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewSummaryCardProps {
    summary: ReviewSummaryDto | null;
    isLoading: boolean;
    error: string | null;
    onRefresh?: () => void;
}

// ---------------------------------------------------------------------------
// Sentiment config
// ---------------------------------------------------------------------------

const SENTIMENT_CONFIG: Record<
    SentimentType,
    { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
    positive: { label: "Rất tốt", color: "#22c55e", icon: "sentiment-very-satisfied" },
    neutral: { label: "Trung bình", color: "#f59e0b", icon: "sentiment-neutral" },
    negative: { label: "Cần cải thiện", color: "#ef4444", icon: "sentiment-very-dissatisfied" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonLine({ width, height = 14 }: { width: DimensionValue; height?: number }) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
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
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeletonLine,
                { width, height, opacity },
            ]}
        />
    );
}

function SkeletonCard() {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <SkeletonLine width={140} height={16} />
                <SkeletonLine width={70} height={24} />
            </View>
            <SkeletonLine width="95%" height={36} />
            <View style={styles.divider} />
            <View style={styles.prosConsRow}>
                <View style={styles.prosSection}>
                    <SkeletonLine width={60} height={14} />
                    <SkeletonLine width="90%" />
                    <SkeletonLine width="85%" />
                    <SkeletonLine width="75%" />
                </View>
                <View style={styles.consSection}>
                    <SkeletonLine width={80} height={14} />
                    <SkeletonLine width="90%" />
                    <SkeletonLine width="80%" />
                </View>
            </View>
        </View>
    );
}

function ProConItem({
    text,
    isPositive,
    delay,
}: {
    text: string;
    isPositive: boolean;
    delay: number;
}) {
    const translateX = useRef(new Animated.Value(isPositive ? -20 : 20)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: 0,
                duration: 350,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 350,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateX, opacity, delay]);

    return (
        <Animated.View
            style={[styles.proConItem, { transform: [{ translateX }], opacity }]}
        >
            <View
                style={[
                    styles.proConDot,
                    { backgroundColor: isPositive ? "#22c55e" : "#f59e0b" },
                ]}
            />
            <Text style={styles.proConText}>{text}</Text>
        </Animated.View>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ReviewSummaryCard({
    summary,
    isLoading,
    error,
    onRefresh,
}: ReviewSummaryCardProps) {
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (summary && !isLoading) {
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [summary, isLoading, cardOpacity]);

    // Loading skeleton
    if (isLoading) {
        return <SkeletonCard />;
    }

    // Error state
    if (error) {
        return (
            <View style={[styles.card, styles.errorCard]}>
                <MaterialIcons name="error-outline" size={24} color="#ef4444" />
                <Text style={styles.errorText}>Không thể tải tóm tắt AI</Text>
                {onRefresh && (
                    <Pressable onPress={onRefresh} style={styles.retryButton}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </Pressable>
                )}
            </View>
        );
    }

    // Empty state
    if (!summary) return null;

    const sentimentCfg = SENTIMENT_CONFIG[summary.overall_sentiment] ?? SENTIMENT_CONFIG.neutral;

    return (
        <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.aiLabelRow}>
                    <MaterialIcons name="auto-awesome" size={16} color="#f59e0b" />
                    <Text style={styles.aiLabel}>Tóm tắt bởi AI</Text>
                    {summary.is_cached && (
                        <View style={styles.cachedBadge}>
                            <Text style={styles.cachedText}>Đã lưu</Text>
                        </View>
                    )}
                </View>

                {/* Sentiment badge */}
                <View style={[styles.sentimentBadge, { borderColor: sentimentCfg.color }]}>
                    <MaterialIcons
                        name={sentimentCfg.icon}
                        size={14}
                        color={sentimentCfg.color}
                    />
                    <Text style={[styles.sentimentText, { color: sentimentCfg.color }]}>
                        {sentimentCfg.label}
                    </Text>
                </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <MaterialIcons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.statValue}>{summary.average_rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>/ 5</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <MaterialIcons name="rate-review" size={16} color={colors.text.secondary} />
                    <Text style={styles.statValue}>{summary.total_reviews_analyzed}</Text>
                    <Text style={styles.statLabel}>đánh giá</Text>
                </View>
            </View>

            {/* AI Summary text */}
            {summary.summary_vi ? (
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{summary.summary_vi}</Text>
                </View>
            ) : null}

            <View style={styles.divider} />

            {/* Pros & Cons */}
            <View style={styles.prosConsRow}>
                {/* Pros */}
                {summary.pros.length > 0 && (
                    <View style={styles.prosSection}>
                        <Text style={styles.sectionTitle}>✨ Ưu điểm</Text>
                        {summary.pros.map((pro, i) => (
                            <ProConItem
                                key={`pro-${i}`}
                                text={pro}
                                isPositive
                                delay={i * 80}
                            />
                        ))}
                    </View>
                )}

                {/* Cons */}
                {summary.cons.length > 0 && (
                    <View style={styles.consSection}>
                        <Text style={styles.sectionTitle}>⚠️ Cần lưu ý</Text>
                        {summary.cons.map((con, i) => (
                            <ProConItem
                                key={`con-${i}`}
                                text={con}
                                isPositive={false}
                                delay={i * 80 + 150}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Refresh button */}
            {onRefresh && (
                <Pressable onPress={onRefresh} style={styles.refreshRow}>
                    <MaterialIcons name="refresh" size={14} color={colors.text.secondary} />
                    <Text style={styles.refreshText}>Cập nhật phân tích</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.18)",
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    errorCard: {
        alignItems: "center",
        gap: 8,
        paddingVertical: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    aiLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    aiLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#d97706", // Darker amber for readability on white bg
        letterSpacing: 0.3,
    },
    cachedBadge: {
        backgroundColor: colors.background.secondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    cachedText: {
        fontSize: 10,
        color: colors.text.tertiary,
    },
    sentimentBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    sentimentText: {
        fontSize: 11,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: colors.border.light,
        marginHorizontal: 4,
    },
    summaryBox: {
        backgroundColor: "rgba(245, 158, 11, 0.06)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: "#f59e0b",
    },
    summaryText: {
        fontSize: 13,
        color: colors.text.primary,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.light,
        marginBottom: 12,
    },
    prosConsRow: {
        gap: 12,
    },
    prosSection: {
        gap: 6,
    },
    consSection: {
        gap: 6,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.text.primary,
        marginBottom: 4,
    },
    proConItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    proConDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 5,
        flexShrink: 0,
    },
    proConText: {
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 20,
        flex: 1,
    },
    skeletonLine: {
        backgroundColor: colors.background.secondary,
        borderRadius: 6,
        marginVertical: 3,
    },
    refreshRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 12,
        justifyContent: "flex-end",
    },
    refreshText: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    errorText: {
        fontSize: 14,
        color: "#ef4444",
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
    },
    retryText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600",
    },
});
