import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
    ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "@/store/zustand/onboarding.store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: "Order for Food",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: require("@/assets/images/walkthrough/order_food.png"),
        buttonText: "Next",
    },
    {
        id: "2",
        title: "Easy Payment",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: require("@/assets/images/walkthrough/easy_payment.png"),
        buttonText: "Next",
    },
    {
        id: "3",
        title: "Fast Delivery",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: require("@/assets/images/walkthrough/fast_delivery.png"),
        buttonText: "Get Started",
    },
];

interface SlideItemProps {
    item: (typeof slides)[0];
}

function SlideItem({ item }: SlideItemProps) {
    return (
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
            {/* Background decorative circles */}
            <View className="absolute inset-0 overflow-hidden">
                <View className="absolute w-20 h-20 rounded-full bg-onboarding-accent top-10 left-5" />
                <View className="absolute w-10 h-10 rounded-full bg-onboarding-accent top-24 right-8" />
                <View className="absolute w-5 h-5 rounded-full bg-onboarding-accent top-48 left-12" />
                <View className="absolute w-14 h-14 rounded-full bg-onboarding-accent bottom-72 right-5" />
                <View className="absolute w-8 h-8 rounded-full bg-onboarding-accent bottom-96 left-8" />
                <View className="absolute w-12 h-12 rounded-full bg-onboarding-accent bottom-60 left-3" />
            </View>

            {/* Illustration */}
            <View className="flex-1 justify-center items-center px-10 pt-16">
                <Image
                    source={item.image}
                    style={{ width: SCREEN_WIDTH - 80, height: 280 }}
                    resizeMode="contain"
                />
            </View>

            {/* Content */}
            <View className="px-8 pb-5">
                <Text className="text-3xl font-bold text-onboarding-brand text-center mb-4">
                    {item.title}
                </Text>
                <Text className="text-base text-gray-500 text-center leading-6">
                    {item.description}
                </Text>
            </View>
        </View>
    );
}

interface PaginationDotsProps {
    currentIndex: number;
}

function PaginationDots({ currentIndex }: PaginationDotsProps) {
    return (
        <View className="flex-row justify-center items-center mb-6">
            {slides.map((_, index) => (
                <View
                    key={index}
                    className={`mx-1 ${currentIndex === index
                        ? "w-6 h-2 rounded bg-onboarding-brand"
                        : "w-2 h-2 rounded-full bg-gray-300"
                        }`}
                />
            ))}
        </View>
    );
}

export default function WalkthroughScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const completeWalkthrough = useOnboardingStore(
        (state) => state.completeWalkthrough
    );

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = useCallback(async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            await completeWalkthrough();
            router.replace("/(auth)/login");
        }
    }, [currentIndex, completeWalkthrough, router]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={({ item }) => <SlideItem item={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
            />

            <View className="px-8 pb-10">
                <PaginationDots currentIndex={currentIndex} />

                <Pressable
                    className="bg-onboarding-brand py-5 rounded-full items-center active:opacity-90"
                    onPress={handleNext}
                >
                    <Text className="text-white text-lg font-semibold">
                        {slides[currentIndex].buttonText}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

