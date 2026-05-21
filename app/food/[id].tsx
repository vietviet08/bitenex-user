import { View, Text, Alert, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
import {
    fetchMenuItemDetail,
    fetchMerchantDetail,
    type MenuItemDetailDto,
    type MerchantDto,
} from "@/services/merchant";

export default function FoodItemDetailScreen() {
    const { id, merchantId } = useLocalSearchParams<{
        id: string;
        merchantId: string;
    }>();

    // Data fetching state
    const [menuItem, setMenuItem] = useState<MenuItemDetailDto | null>(null);
    const [merchant, setMerchant] = useState<MerchantDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Selection state — keyed by option group id
    const [selectedOptions, setSelectedOptions] = useState<
        Record<string, string[]>
    >({});
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");

    // ── Fetch data ───────────────────────────────────────────────────

    const load = useCallback(async () => {
        if (!id || !merchantId) {
            setErrorMessage("Missing item or merchant ID");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setErrorMessage("");
        try {
            const [data, merchantData] = await Promise.all([
                fetchMenuItemDetail(merchantId, id),
                fetchMerchantDetail(merchantId),
            ]);
            setMenuItem(data);
            setMerchant(merchantData);

            // Initialize selections: for "single" groups, pre-select first option
            const initial: Record<string, string[]> = {};
            for (const group of data.option_groups) {
                if (
                    group.selection_type === "single" &&
                    group.options.length > 0
                ) {
                    initial[group.id] = [group.options[0].id];
                } else {
                    initial[group.id] = [];
                }
            }
            setSelectedOptions(initial);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Failed to load item",
            );
        } finally {
            setIsLoading(false);
        }
    }, [id, merchantId]);

    useEffect(() => {
        load();
    }, [load]);

    // ── Derived data for existing components ─────────────────────────

    // Convert option groups into SizeOption[] / AddOnOption[] compatible shapes
    const singleGroups = useMemo(
        () =>
            (menuItem?.option_groups ?? []).filter(
                (g) => g.selection_type === "single",
            ),
        [menuItem],
    );

    const multipleGroups = useMemo(
        () =>
            (menuItem?.option_groups ?? []).filter(
                (g) => g.selection_type === "multiple",
            ),
        [menuItem],
    );

    // ── Price calculation ────────────────────────────────────────────

    const totalPrice = useMemo(() => {
        if (!menuItem) return 0;
        let optionsDelta = 0;
        for (const group of menuItem.option_groups) {
            const selected = selectedOptions[group.id] ?? [];
            for (const optId of selected) {
                const opt = group.options.find((o) => o.id === optId);
                if (opt) optionsDelta += opt.price_delta;
            }
        }
        return (menuItem.price + optionsDelta) * quantity;
    }, [menuItem, selectedOptions, quantity]);

    // ── Handlers ─────────────────────────────────────────────────────

    const handleSelectSingleOption = useCallback(
        (groupId: string, optionId: string) => {
            setSelectedOptions((prev) => ({ ...prev, [groupId]: [optionId] }));
        },
        [],
    );

    const handleToggleMultipleOption = useCallback(
        (groupId: string, optionId: string) => {
            setSelectedOptions((prev) => {
                const current = prev[groupId] ?? [];
                const next = current.includes(optionId)
                    ? current.filter((id) => id !== optionId)
                    : [...current, optionId];
                return { ...prev, [groupId]: next };
            });
        },
        [],
    );

    const handleIncrement = useCallback(() => {
        setQuantity((prev) => prev + 1);
    }, []);

    const handleDecrement = useCallback(() => {
        setQuantity((prev) => Math.max(1, prev - 1));
    }, []);

    const addItem = useCartStore((state) => state.addItem);
    const hasMerchantConflict = useCartStore((state) => state.hasMerchantConflict);
    const switchMerchantAndAdd = useCartStore((state) => state.switchMerchantAndAdd);

    const buildCartItemData = useCallback(() => {
        if (!menuItem || !merchantId) return null;

        const firstSingleGroup = singleGroups[0];
        const selectedSizeOptId = firstSingleGroup
            ? (selectedOptions[firstSingleGroup.id]?.[0] ?? "")
            : "";
        const selectedSizeOpt = firstSingleGroup?.options.find(
            (o) => o.id === selectedSizeOptId,
        );

        const allAddOnIds: string[] = [];
        const allAddOnNames: string[] = [];
        let addOnsTotal = 0;
        for (const group of multipleGroups) {
            const selected = selectedOptions[group.id] ?? [];
            for (const optId of selected) {
                const opt = group.options.find((o) => o.id === optId);
                if (opt) {
                    allAddOnIds.push(opt.id);
                    allAddOnNames.push(opt.name);
                    addOnsTotal += opt.price_delta;
                }
            }
        }

        let extraSingleDelta = 0;
        for (let i = 1; i < singleGroups.length; i++) {
            const group = singleGroups[i];
            const sel = selectedOptions[group.id]?.[0];
            if (sel) {
                const opt = group.options.find((o) => o.id === sel);
                if (opt) {
                    allAddOnIds.push(opt.id);
                    allAddOnNames.push(opt.name);
                    extraSingleDelta += opt.price_delta;
                }
            }
        }

        return {
            foodItemId: menuItem.id,
            merchantId,
            name: menuItem.name,
            image: menuItem.image_url ?? "",
            basePrice: menuItem.price,
            quantity,
            customization: {
                sizeId: selectedSizeOptId,
                sizeName: selectedSizeOpt?.name ?? "",
                sizePriceDelta: selectedSizeOpt?.price_delta ?? 0,
                addOnIds: allAddOnIds,
                addOnNames: allAddOnNames,
                addOnsTotal: addOnsTotal + extraSingleDelta,
                specialInstructions,
            },
            selectedOptions: Object.entries(selectedOptions)
                .filter(([, ids]) => ids.length > 0)
                .flatMap(([groupId, optionIds]) =>
                    optionIds.map((optionId) => ({
                        option_group_id: groupId,
                        option_id: optionId,
                    })),
                ),
        };
    }, [
        menuItem,
        merchantId,
        selectedOptions,
        singleGroups,
        multipleGroups,
        quantity,
        specialInstructions,
    ]);

    const showAddedAlert = useCallback(
        (itemName: string, qty: number) => {
            Alert.alert(
                "Added to Cart 🛒",
                `${qty}x ${itemName} added to your cart.`,
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
        },
        [],
    );

    const handleAddToCart = useCallback(() => {
        const itemData = buildCartItemData();
        if (!itemData) return;

        if (hasMerchantConflict(itemData.merchantId)) {
            Alert.alert(
                "Different Restaurant",
                "Your cart has items from another restaurant. Clear the cart and add this item?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Clear & Add",
                        style: "destructive",
                        onPress: () => {
                            switchMerchantAndAdd(itemData, merchant?.delivery_fee ?? 0);
                            showAddedAlert(itemData.name, itemData.quantity);
                        },
                    },
                ],
            );
            return;
        }

        addItem(itemData, merchant?.delivery_fee ?? 0);
        showAddedAlert(itemData.name, itemData.quantity);
    }, [
        buildCartItemData,
        hasMerchantConflict,
        switchMerchantAndAdd,
        addItem,
        showAddedAlert,
        merchant,
    ]);

    // Bottom sheet setup
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["70%", "90%"], []);

    // ── Loading / Error states ───────────────────────────────────────

    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-sm text-neutral-500">
                    Loading item details...
                </Text>
            </View>
        );
    }

    if (errorMessage || !menuItem) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-6xl mb-4">😕</Text>
                <Text className="text-lg font-semibold text-neutral-900 text-center">
                    {errorMessage || "Item not found"}
                </Text>
                <Pressable
                    onPress={load}
                    className="mt-4 rounded-xl bg-primary-500 px-6 py-3"
                >
                    <Text className="text-sm font-semibold text-white">Retry</Text>
                </Pressable>
                <Pressable onPress={() => router.back()} className="mt-3">
                    <Text className="text-sm font-semibold text-primary-500">
                        Go back
                    </Text>
                </Pressable>
            </View>
        );
    }

    // ── Render ───────────────────────────────────────────────────────

    const hasOptionGroups = menuItem.option_groups.length > 0;

    return (
        <View className="flex-1 bg-white">
            {/* Hero Image with Header Actions */}
            <FoodItemHero imageUrl={menuItem.image_url ?? undefined} />
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
                        name={menuItem.name}
                        description={menuItem.description ?? ""}
                        price={menuItem.price}
                    />

                    {hasOptionGroups ? (
                        <>
                            {/* Render each single-select group as radio selectors */}
                            {singleGroups.map((group) => {
                                const sizes: SizeOption[] = group.options.map(
                                    (opt) => ({
                                        id: opt.id,
                                        name: opt.name,
                                        priceDelta: opt.price_delta,
                                    }),
                                );
                                return (
                                    <View key={group.id}>
                                        <View className="h-2 bg-neutral-100" />
                                        <SizeSelector
                                            sizes={sizes}
                                            selectedSizeId={
                                                selectedOptions[group.id]?.[0] ?? ""
                                            }
                                            onSelectSize={(optId) =>
                                                handleSelectSingleOption(
                                                    group.id,
                                                    optId,
                                                )
                                            }
                                            label={group.name}
                                        />
                                    </View>
                                );
                            })}

                            {/* Render each multi-select group as checkbox selectors */}
                            {multipleGroups.map((group) => {
                                const addOns: AddOnOption[] = group.options.map(
                                    (opt) => ({
                                        id: opt.id,
                                        name: opt.name,
                                        price: opt.price_delta,
                                    }),
                                );
                                return (
                                    <View key={group.id}>
                                        <View className="h-2 bg-neutral-100" />
                                        <CustomizeSection
                                            addOns={addOns}
                                            selectedAddOnIds={
                                                selectedOptions[group.id] ?? []
                                            }
                                            onToggleAddOn={(optId) =>
                                                handleToggleMultipleOption(
                                                    group.id,
                                                    optId,
                                                )
                                            }
                                            label={group.name}
                                        />
                                    </View>
                                );
                            })}
                        </>
                    ) : null}

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
