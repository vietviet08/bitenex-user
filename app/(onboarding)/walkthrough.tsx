import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "@/store/zustand/onboarding.store";
import { useAuth } from "@/hooks/useAuth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WalkthroughScreenData {
    id: number;
    title: string;
    description: string;
    illustration: ImageSourcePropType | null;
    buttonText: string;
}

// TODO: Replace null with actual image imports when illustrations are added
// import fastDeliveryIllustration from "@/assets/images/walkthrough/fast-delivery.png";
// import easyPaymentIllustration from "@/assets/images/walkthrough/easy-payment.png";
// import orderFoodIllustration from "@/assets/images/walkthrough/order-food.png";

const WALKTHROUGH_SCREENS: WalkthroughScreenData[] = [
    {
        id: 1,
        title: "Fast Delivery",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        illustration: null, // fastDeliveryIllustration,
        buttonText: "Get Started",
    },
    {
        id: 2,
        title: "Easy Payment",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        illustration: null, // easyPaymentIllustration,
        buttonText: "Next",
    },
    {
        id: 3,
        title: "Order for Food",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        illustration: null, // orderFoodIllustration,
        buttonText: "Next",
    },
];

// Design colors from spec (custom colors not in Tailwind config)
const PRIMARY_GREEN = "#34C15A";
const DARK_GRAY = "#2B3547";
const LIGHT_GREEN_ACCENT = "#E8F7EC";
const GRAY_CIRCLE = "#D9D9D9";
const TEXT_DARK = "#333333";

export default function WalkthroughScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const { completeWalkthrough } = useOnboardingStore();
    const { isAuthenticated } = useAuth();

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < WALKTHROUGH_SCREENS.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        await completeWalkthrough();
        if (isAuthenticated) {
            router.replace("/(tabs)");
        } else {
            router.replace("/(auth)/login");
        }
    };

    const renderScreen = ({ item }: { item: WalkthroughScreenData }) => {
        const isFirstScreen = item.id === 1;
        const isLastScreen = item.id === WALKTHROUGH_SCREENS.length;

        const handleButtonPress = () => {
            if (isFirstScreen || isLastScreen) {
                handleComplete();
            } else {
                handleNext();
            }
        };

        return (
            <View
                className="flex-1 bg-background-primary"
                style={{ width: SCREEN_WIDTH }}
            >
                {/* Background decorative circles */}
                <View className="absolute w-full h-full">
                    {/* Light green circular accents */}
                    <View
                        className="absolute rounded-full"
                        style={{
                            top: 50,
                            left: 50,
                            width: 100,
                            height: 100,
                            backgroundColor: LIGHT_GREEN_ACCENT,
                            opacity: 0.5,
                        }}
                    />
                    <View
                        className="absolute rounded-full"
                        style={{
                            top: 150,
                            right: 30,
                            width: 60,
                            height: 60,
                            backgroundColor: LIGHT_GREEN_ACCENT,
                            opacity: 0.4,
                        }}
                    />
                    <View
                        className="absolute rounded-full"
                        style={{
                            top: 250,
                            left: 20,
                            width: 80,
                            height: 80,
                            backgroundColor: LIGHT_GREEN_ACCENT,
                            opacity: 0.3,
                        }}
                    />
                </View>

                {/* Content */}
                <SafeAreaView className="flex-1 justify-between px-2xl pt-4xl pb-4xl">
                    {/* Illustration placeholder */}
                    <View className="flex-1 justify-center items-center mt-4xl">
                        {item.illustration ? (
                            <Image
                                source={item.illustration}
                                className="w-4/5"
                                style={{
                                    height: SCREEN_WIDTH * 0.8,
                                    resizeMode: "contain",
                                }}
                            />
                        ) : (
                            <View
                                className="justify-center items-center rounded-xl"
                                style={{
                                    width: SCREEN_WIDTH * 0.7,
                                    height: SCREEN_WIDTH * 0.7,
                                    backgroundColor: LIGHT_GREEN_ACCENT,
                                }}
                            >
                                <Text
                                    className="text-base font-medium"
                                    style={{ color: DARK_GRAY }}
                                >
                                    {item.title} Illustration
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Text Content */}
                    <View className="mb-3xl">
                        <Text
                            className="text-3xl font-bold mb-lg text-left"
                            style={{ color: PRIMARY_GREEN }}
                        >
                            {item.title}
                        </Text>
                        <Text
                            className="text-base font-regular text-left leading-6"
                            style={{ color: TEXT_DARK }}
                        >
                            {item.description}
                        </Text>
                    </View>

                    {/* Pagination Indicators */}
                    <View className="flex-row justify-center items-center mb-2xl gap-2">
                        {WALKTHROUGH_SCREENS.map((item, index) => {
                            const isActive = index === currentIndex;
                            return (
                                <View
                                    key={item.id}
                                    className="h-2 rounded-sm"
                                    style={{
                                        width: isActive ? 32 : 8,
                                        backgroundColor: isActive
                                            ? PRIMARY_GREEN
                                            : GRAY_CIRCLE,
                                    }}
                                />
                            );
                        })}
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        onPress={handleButtonPress}
                        className="rounded-3xl py-lg px-3xl items-center justify-center w-full"
                        style={{ backgroundColor: PRIMARY_GREEN }}
                    >
                        <Text className="text-base font-bold text-text-inverse">
                            {item.buttonText}
                        </Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background-primary">
            <FlatList
                ref={flatListRef}
                data={WALKTHROUGH_SCREENS}
                renderItem={renderScreen}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                onScrollToIndexFailed={(info) => {
                    // Handle scroll to index failure
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: false,
                        });
                    }, 100);
                }}
            />
        </View>
    );
}
