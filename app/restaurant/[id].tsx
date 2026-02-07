import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { RestaurantHeaderActions } from "@/components/restaurant/RestaurantHeaderActions";
import {
    RestaurantInfo,
    type PromoTag,
} from "@/components/restaurant/RestaurantInfo";
import { MenuCategoryTabs } from "@/components/restaurant/MenuCategoryTabs";
import { MenuItem, type MenuItemData } from "@/components/restaurant/MenuItem";
import { FloatingCartBar } from "@/components/restaurant/FloatingCartBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";

// ── Mock data ──────────────────────────────────────────────

const RESTAURANT = {
    id: "1",
    name: "Siam Spicy Wok",
    rating: 4.8,
    reviewCount: "1.2k+",
    cuisine: "Thai Cuisine",
    priceLevel: "$$",
    deliveryTime: "25m",
    heroImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC-KqnP2dPypC3Rp9KLIx7rZ96zirn0Jiqx3LN8hALgJ4LUriX9zCBiAEA4jq5PbT7Jo82oe8CazOr6LFjJf681E0imRYxK1S4kj3i1YUMduuz83WWnwWfMi4O5LhDFknh83sM_mBKe23Zz7a_BHplO9fhK9rV4TW5W7fdJgAX2zkMlg90Jz6JjsalWl2Xgump84ydBkXsC2WmQKTPOw5wlOGQZ6I8SgbYxQM5OqD_fDdFkClGjHdd-9EiXOrTMUPb3e34TUgLC5s0",
};

const PROMO_TAGS: PromoTag[] = [
    {
        id: "1",
        icon: "local-shipping",
        text: "Free Delivery",
        variant: "primary",
    },
    {
        id: "2",
        icon: "local-offer",
        text: "20% Off Orders > $15",
        variant: "red",
    },
    { id: "3", icon: "eco", text: "Sustainable Packaging", variant: "green" },
];

const CATEGORIES = ["Popular", "Rice Dishes", "Noodles", "Sides", "Drinks"];

const MENU_ITEMS: MenuItemData[] = [
    {
        id: "1",
        name: "Signature Pad Kra Pao",
        description:
            "Minced chicken stir-fried with holy basil, chilies, and garlic served over jasmine rice.",
        price: 5.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM4NKKHzNIjZmW5WMGR6QjYswmtmV8EFyvbUseWZMsThUe3LLMGD63MXL7zIfQNrhXyYPvE2h-Lf1kXaslbkFY2US5pMY15yEE5NWolYpzgF3vK5n1jxcCb12Dc7gJ2972L6aiILzJMmAoTXd8uHpb8pwLjgfbqbhPRACAg6YwONrh-VrzQXE1PojFmQQx1mXGq8vqO-HycYIaqtfeodI9NUJEdWO3DQBoZ05X8el6CEmtPj4hziScVbd7LCwWR8Ur_ksbU1xUZKk",
        category: "Popular",
    },
    {
        id: "2",
        name: "Creamy Tom Yum Goong",
        description:
            "Authentic spicy prawn soup with lemongrass, galangal, kaffir lime leaves, and mushrooms.",
        price: 8.0,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNPVopOKO7tKnRRgorYP3wW1S4kGJc_rdvgDK_SJnBwwEK7DgmIfRaUFNe6sqo9ZQZjN771WOQ0V71uVPzgZvFQoGmjHhw8AtwkWyoWDjzVp8zii6u43BxgrnZgDOyPvH1qQeXEikS7fx_yZxwx_HmRhqr4ClnXUqbMeiwp6-Qxa-dFwxVG8Horl7iYfqpdI87AeN8E-i6cfW_dFypLmqjmW0uLjdwSZD6LrAK9t952U52twVd3Qmk5B0wDnX6fQmLD1watIql3Ao",
        category: "Popular",
    },
    {
        id: "3",
        name: "Pineapple Fried Rice",
        description:
            "Yellow curry fried rice with pineapple chunks, raisins, cashews, and chicken.",
        price: 7.25,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJOxN2CcniibU-or8reNIelf2l9t_wwNQG1pxmeijX6hsmoC_GDT-YCgSddccMlluP4mdRx4n12Jpb1Of01hOQqW8-g6JcHhceFaT0tQFG6mbzsJiaSwf_k1SO8WoLKVm9u9xp11I7razuEZL4e_xec_aIkFbCXG_hc8YvyuhK-RPfDlBPc5aX6o0Y0APbg-Wg1XgDdm5CE9WO1zHrNI84n0wloHQWiRI0cIo30M-7kcmxQHpQPkDs-whI5acaYTD4vIBTBvpQ2-g",
        category: "Rice Dishes",
    },
    {
        id: "4",
        name: "Khao Man Gai",
        description:
            "Hainanese style chicken rice served with cucumber garnish and chili sauce.",
        price: 6.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjf5RIGDiE-9Ta39MEi2LWbtMZONUJaCKZOyoGLFSUXJgoIpO3Q8vAEens7Y50gi3XcB9JzhTlTvhZLgYIcYulyVfYQKqgtNy4CQkkoPsdnILFXV-fPNziUWyMvucz0Ot47QykAbCOM1lDrrnzKGKrYq3aUTquTPlYz1AZVsyKn5rcFC5ClsB1D7HcdHWiNVE0mzColze6peyzY4ux04UYEdR9tjfrNTHp0xXye2o65M7-BC1HevQ15l6KauqbC0UivaLMxhHJ7w",
        category: "Rice Dishes",
    },
    {
        id: "5",
        name: "Khao Man Gai",
        description:
            "Hainanese style chicken rice served with cucumber garnish and chili sauce.",
        price: 6.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjf5RIGDiE-9Ta39MEi2LWbtMZONUJaCKZOyoGLFSUXJgoIpO3Q8vAEens7Y50gi3XcB9JzhTlTvhZLgYIcYulyVfYQKqgtNy4CQkkoPsdnILFXV-fPNziUWyMvucz0Ot47QykAbCOM1lDrrnzKGKrYq3aUTquTPlYz1AZVsyKn5rcFC5ClsB1D7HcdHWiNVE0mzColze6peyzY4ux04UYEdR9tjfrNTHp0xXye2o65M7-BC1HevQ15l6KauqbC0UivaLMxhHJ7w",
        category: "Rice Dishes",
    },
    {
        id: "6",
        name: "Khao Man Gai",
        description:
            "Hainanese style chicken rice served with cucumber garnish and chili sauce.",
        price: 6.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjf5RIGDiE-9Ta39MEi2LWbtMZONUJaCKZOyoGLFSUXJgoIpO3Q8vAEens7Y50gi3XcB9JzhTlTvhZLgYIcYulyVfYQKqgtNy4CQkkoPsdnILFXV-fPNziUWyMvucz0Ot47QykAbCOM1lDrrnzKGKrYq3aUTquTPlYz1AZVsyKn5rcFC5ClsB1D7HcdHWiNVE0mzColze6peyzY4ux04UYEdR9tjfrNTHp0xXye2o65M7-BC1HevQ15l6KauqbC0UivaLMxhHJ7w",
        category: "Rice Dishes",
    },
    {
        id: "7",
        name: "Khao Man Gai",
        description:
            "Hainanese style chicken rice served with cucumber garnish and chili sauce.",
        price: 6.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjf5RIGDiE-9Ta39MEi2LWbtMZONUJaCKZOyoGLFSUXJgoIpO3Q8vAEens7Y50gi3XcB9JzhTlTvhZLgYIcYulyVfYQKqgtNy4CQkkoPsdnILFXV-fPNziUWyMvucz0Ot47QykAbCOM1lDrrnzKGKrYq3aUTquTPlYz1AZVsyKn5rcFC5ClsB1D7HcdHWiNVE0mzColze6peyzY4ux04UYEdR9tjfrNTHp0xXye2o65M7-BC1HevQ15l6KauqbC0UivaLMxhHJ7w",
        category: "Rice Dishes",
    },
    {
        id: "8",
        name: "Khao Man Gai",
        description:
            "Hainanese style chicken rice served with cucumber garnish and chili sauce.",
        price: 6.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLjf5RIGDiE-9Ta39MEi2LWbtMZONUJaCKZOyoGLFSUXJgoIpO3Q8vAEens7Y50gi3XcB9JzhTlTvhZLgYIcYulyVfYQKqgtNy4CQkkoPsdnILFXV-fPNziUWyMvucz0Ot47QykAbCOM1lDrrnzKGKrYq3aUTquTPlYz1AZVsyKn5rcFC5ClsB1D7HcdHWiNVE0mzColze6peyzY4ux04UYEdR9tjfrNTHp0xXye2o65M7-BC1HevQ15l6KauqbC0UivaLMxhHJ7w",
        category: "Rice Dishes",
    },
];

// ── Section helpers ────────────────────────────────────────

const SECTION_EMOJI: Record<string, string> = {
    Popular: "🔥",
    "Rice Dishes": "🍚",
    Noodles: "🍜",
    Sides: "🥗",
    Drinks: "🥤",
};

const SECTION_LABELS: Record<string, string> = {
    Popular: "Popular Choices",
    "Rice Dishes": "Rice Dishes",
    Noodles: "Noodles",
    Sides: "Sides",
    Drinks: "Drinks",
};

function groupByCategory(items: MenuItemData[]) {
    const groups: { category: string; items: MenuItemData[] }[] = [];
    const map = new Map<string, MenuItemData[]>();

    for (const item of items) {
        const list = map.get(item.category);
        if (list != null) {
            list.push(item);
        } else {
            map.set(item.category, [item]);
        }
    }

    for (const [category, categoryItems] of map) {
        groups.push({ category, items: categoryItems });
    }

    return groups;
}

// ── Layout constants ───────────────────────────────────────

const HERO_HEIGHT = 320;

// ── Screen ─────────────────────────────────────────────────

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState(0);
    const insets = useSafeAreaInsets();

    const sections = groupByCategory(MENU_ITEMS);

    // Scroll tracking — single shared value drives all animations
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Hero: parallax background — translates at half speed, fades out
    const heroAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, HERO_HEIGHT],
            [0, -HERO_HEIGHT * 0.5],
            Extrapolation.CLAMP,
        );
        const opacity = interpolate(
            scrollY.value,
            [0, HERO_HEIGHT * 0.6],
            [1, 0],
            Extrapolation.CLAMP,
        );
        return { transform: [{ translateY }], opacity };
    });

    // Compact header — appears when hero is scrolled past
    const compactHeaderStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [HERO_HEIGHT * 0.7, HERO_HEIGHT],
            [0, 1],
            Extrapolation.CLAMP,
        );
        const translateY = interpolate(
            scrollY.value,
            [HERO_HEIGHT * 0.7, HERO_HEIGHT],
            [-8, 0],
            Extrapolation.CLAMP,
        );
        return { opacity, transform: [{ translateY }] };
    });

    return (
        <View className="flex-1 bg-white">
            {/* ─── Parallax Hero (absolute background) ─── */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: HERO_HEIGHT,
                        zIndex: 0,
                    },
                    heroAnimatedStyle,
                ]}
            >
                <RestaurantHero imageUrl={RESTAURANT.heroImage} />
            </Animated.View>

            {/* ─── Single ScrollView — all content scrolls together ─── */}
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                stickyHeaderIndices={[1]}
                style={{ zIndex: 1 }}
            >
                {/* [0] Hero spacer + Restaurant info */}
                <View>
                    {/* Transparent spacer — lets hero show through */}
                    <View style={{ height: HERO_HEIGHT }} />

                    {/* Restaurant info card — scrolls with content */}
                    <View
                        className="bg-white rounded-t-3xl pt-6 px-5"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -3 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <RestaurantInfo
                            name={RESTAURANT.name}
                            rating={RESTAURANT.rating}
                            reviewCount={RESTAURANT.reviewCount}
                            cuisine={RESTAURANT.cuisine}
                            priceLevel={RESTAURANT.priceLevel}
                            deliveryTime={RESTAURANT.deliveryTime}
                            tags={PROMO_TAGS}
                        />
                    </View>
                </View>

                {/* [1] Sticky category tabs */}
                <View className="bg-white" style={{ zIndex: 5 }}>
                    <MenuCategoryTabs
                        categories={CATEGORIES}
                        activeIndex={activeTab}
                        onSelect={setActiveTab}
                    />
                </View>

                {/* [2] Menu sections */}
                <View className="px-5 pt-6 bg-white">
                    <View className="gap-8">
                        {sections.map((section, sectionIndex) => (
                            <View key={section.category}>
                                <Text
                                    className={`text-xl font-bold text-neutral-900 mb-4 ${sectionIndex > 0 ? "mt-2" : ""}`}
                                >
                                    {SECTION_LABELS[section.category] ??
                                        section.category}{" "}
                                    {SECTION_EMOJI[section.category] ?? ""}
                                </Text>
                                <View className="gap-6">
                                    {section.items.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            <MenuItem item={item} />
                                            {index <
                                                section.items.length - 1 && (
                                                <View className="h-px bg-neutral-100 w-full" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.ScrollView>

            {/* ─── Header actions (back, search, share) — always on top ─── */}
            <RestaurantHeaderActions />

            {/* ─── Compact header — fades in when hero scrolls away ─── */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 30,
                        backgroundColor: "#fff",
                        borderBottomWidth: 1,
                        borderBottomColor: "#f5f5f5",
                        paddingTop: insets.top + 4,
                        paddingBottom: 8,
                        paddingHorizontal: 16,
                    },
                    compactHeaderStyle,
                ]}
                pointerEvents="none"
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingLeft: 40,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            className="text-sm font-bold text-neutral-900"
                            numberOfLines={1}
                        >
                            {RESTAURANT.name}
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 2,
                                gap: 6,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <IconSymbol
                                    name="star"
                                    size={12}
                                    color={colors.primary[500]}
                                />
                                <Text className="text-xs font-semibold text-neutral-800">
                                    {RESTAURANT.rating}
                                </Text>
                            </View>
                            <Text className="text-xs text-neutral-300">•</Text>
                            <Text
                                className="text-xs text-neutral-500"
                                numberOfLines={1}
                            >
                                {RESTAURANT.cuisine}
                            </Text>
                            <Text className="text-xs text-neutral-300">•</Text>
                            <Text className="text-xs text-neutral-500">
                                {RESTAURANT.priceLevel}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            backgroundColor: colors.primary[50],
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            marginLeft: 8,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: colors.primary[500],
                            }}
                        >
                            {RESTAURANT.deliveryTime}
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* Floating cart bar */}
            <FloatingCartBar itemCount={2} total={13.5} />
        </View>
    );
}
