import { View, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

import {
    FoodItemHero,
    FoodItemHeaderActions,
    FoodItemInfo,
    SizeSelector,
    CustomizeSection,
    SpecialInstructions,
    AddToCartBar,
    type SizeOption,
    type AddOnOption,
} from "@/components/food-item";
import { useCartStore } from "@/store/zustand/cart.store";

// Mock food item data
interface FoodItem {
    id: string;
    name: string;
    description: string;
    image: string;
    basePrice: number;
    sizes: SizeOption[];
    addOns: AddOnOption[];
}

const MOCK_FOOD_ITEMS: Record<string, FoodItem> = {
    "1": {
        id: "1",
        name: "Classic Beef Burger",
        description:
            "Juicy beef patty with fresh lettuce, tomatoes, pickles, and our signature sauce on a toasted brioche bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        basePrice: 12.99,
        sizes: [
            { id: "small", name: "Small", priceDelta: 0 },
            { id: "medium", name: "Medium", priceDelta: 2.0 },
            { id: "large", name: "Large", priceDelta: 4.0 },
        ],
        addOns: [
            { id: "cheese", name: "Extra Cheese", price: 1.5 },
            { id: "bacon", name: "Crispy Bacon", price: 2.0 },
            { id: "avocado", name: "Fresh Avocado", price: 2.5 },
            { id: "egg", name: "Fried Egg", price: 1.5 },
        ],
    },
    "2": {
        id: "2",
        name: "Margherita Pizza",
        description:
            "Traditional Italian pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800",
        basePrice: 14.99,
        sizes: [
            { id: "personal", name: 'Personal (8")', priceDelta: 0 },
            { id: "medium", name: 'Medium (12")', priceDelta: 4.0 },
            { id: "large", name: 'Large (16")', priceDelta: 8.0 },
        ],
        addOns: [
            { id: "pepperoni", name: "Pepperoni", price: 2.0 },
            { id: "mushrooms", name: "Mushrooms", price: 1.5 },
            { id: "olives", name: "Black Olives", price: 1.0 },
            { id: "jalapeños", name: "Jalapeños", price: 0.75 },
        ],
    },
};

// Default fallback for unknown IDs
const DEFAULT_FOOD_ITEM: FoodItem = {
    id: "0",
    name: "Delicious Food Item",
    description: "A tasty food item prepared with fresh ingredients.",
    image: "",
    basePrice: 9.99,
    sizes: [
        { id: "regular", name: "Regular", priceDelta: 0 },
        { id: "large", name: "Large", priceDelta: 3.0 },
    ],
    addOns: [{ id: "extra", name: "Extra Portion", price: 3.0 }],
};

export default function FoodItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const foodItem = MOCK_FOOD_ITEMS[id ?? ""] ?? DEFAULT_FOOD_ITEM;

    // State
    const [selectedSizeId, setSelectedSizeId] = useState(
        foodItem.sizes[0]?.id ?? "",
    );
    const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");

    // Calculate total price
    const totalPrice = useMemo(() => {
        const selectedSize = foodItem.sizes.find(
            (s) => s.id === selectedSizeId,
        );
        const sizeDelta = selectedSize?.priceDelta ?? 0;

        const addOnsTotal = selectedAddOnIds.reduce((sum, addOnId) => {
            const addOn = foodItem.addOns.find((a) => a.id === addOnId);
            return sum + (addOn?.price ?? 0);
        }, 0);

        return (foodItem.basePrice + sizeDelta + addOnsTotal) * quantity;
    }, [foodItem, selectedSizeId, selectedAddOnIds, quantity]);

    // Handlers
    const handleSelectSize = useCallback((sizeId: string) => {
        setSelectedSizeId(sizeId);
    }, []);

    const handleToggleAddOn = useCallback((addOnId: string) => {
        setSelectedAddOnIds((prev) =>
            prev.includes(addOnId)
                ? prev.filter((id) => id !== addOnId)
                : [...prev, addOnId],
        );
    }, []);

    const handleIncrement = useCallback(() => {
        setQuantity((prev) => prev + 1);
    }, []);

    const handleDecrement = useCallback(() => {
        setQuantity((prev) => Math.max(1, prev - 1));
    }, []);

    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = useCallback(() => {
        const selectedSize = foodItem.sizes.find(
            (s) => s.id === selectedSizeId,
        );
        const selectedAddOns = foodItem.addOns.filter((a) =>
            selectedAddOnIds.includes(a.id),
        );
        const addOnsTotal = selectedAddOns.reduce(
            (sum, addOn) => sum + addOn.price,
            0,
        );

        addItem({
            foodItemId: foodItem.id,
            name: foodItem.name,
            image: foodItem.image,
            basePrice: foodItem.basePrice,
            quantity,
            customization: {
                sizeId: selectedSizeId,
                sizeName: selectedSize?.name ?? "",
                sizePriceDelta: selectedSize?.priceDelta ?? 0,
                addOnIds: selectedAddOnIds,
                addOnNames: selectedAddOns.map((a) => a.name),
                addOnsTotal,
                specialInstructions,
            },
        });

        Alert.alert(
            "Added to Cart 🛒",
            `${quantity}x ${foodItem.name} added to your cart.`,
            [
                {
                    text: "Continue Shopping",
                    style: "cancel",
                    onPress: () => router.back(),
                },
                {
                    text: "View Cart",
                    onPress: () => router.push("/(tabs)/cart"),
                },
            ],
        );
    }, [
        foodItem,
        selectedSizeId,
        selectedAddOnIds,
        quantity,
        specialInstructions,
        addItem,
    ]);

    // Bottom sheet setup
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["70%", "90%"], []);

    return (
        <View className="flex-1 bg-white">
            {/* Hero Image with Header Actions */}
            <FoodItemHero imageUrl={foodItem.image} />
            <FoodItemHeaderActions />

            {/* Modal Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={false}
                backgroundStyle={{
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: "#fff",
                }}
                handleIndicatorStyle={{
                    backgroundColor: "#d4d4d4",
                    width: 40,
                }}
                enableDynamicSizing={false}
            >
                <BottomSheetScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <FoodItemInfo
                        name={foodItem.name}
                        description={foodItem.description}
                        price={foodItem.basePrice}
                    />

                    <View className="h-2 bg-neutral-100" />

                    <SizeSelector
                        sizes={foodItem.sizes}
                        selectedSizeId={selectedSizeId}
                        onSelectSize={handleSelectSize}
                    />

                    <View className="h-2 bg-neutral-100" />

                    <CustomizeSection
                        addOns={foodItem.addOns}
                        selectedAddOnIds={selectedAddOnIds}
                        onToggleAddOn={handleToggleAddOn}
                    />

                    <View className="h-2 bg-neutral-100" />

                    <SpecialInstructions
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                    />
                </BottomSheetScrollView>
            </BottomSheet>

            {/* Fixed Add to Cart Bar */}
            <AddToCartBar
                quantity={quantity}
                totalPrice={totalPrice}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onAddToCart={handleAddToCart}
            />
        </View>
    );
}
