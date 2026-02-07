import React, { useState, useMemo } from "react";
import { View } from "react-native";
import {
    OrdersHeader,
    OrdersTabs,
    OrdersList,
    type OrderTabType,
    type Order,
} from "@/components/orders";

// Mock data for orders
const MOCK_ORDERS: Order[] = [
    {
        id: "1",
        restaurantName: "Burger Palace",
        restaurantImage:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
        itemCount: 3,
        distance: "2.4 km",
        price: 28.5,
        status: "preparing",
        createdAt: "2024-01-15T10:30:00Z",
    },
    {
        id: "2",
        restaurantName: "Pizza Heaven",
        restaurantImage:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
        itemCount: 2,
        distance: "1.8 km",
        price: 35.0,
        status: "paid",
        createdAt: "2024-01-15T09:00:00Z",
    },
    {
        id: "3",
        restaurantName: "Sushi Master",
        restaurantImage:
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200",
        itemCount: 5,
        distance: "3.2 km",
        price: 65.0,
        status: "completed",
        createdAt: "2024-01-14T18:00:00Z",
    },
    {
        id: "4",
        restaurantName: "Taco Fiesta",
        restaurantImage:
            "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200",
        itemCount: 4,
        distance: "2.0 km",
        price: 22.0,
        status: "completed",
        createdAt: "2024-01-13T12:00:00Z",
    },
    {
        id: "5",
        restaurantName: "Thai Spice",
        restaurantImage:
            "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=200",
        itemCount: 2,
        distance: "4.5 km",
        price: 45.0,
        status: "cancelled",
        createdAt: "2024-01-12T20:00:00Z",
    },
];

export default function OrdersScreen() {
    const [activeTab, setActiveTab] = useState<OrderTabType>("active");

    const filteredOrders = useMemo(() => {
        return MOCK_ORDERS.filter((order) => {
            switch (activeTab) {
                case "active":
                    return ["paid", "preparing", "delivering"].includes(
                        order.status,
                    );
                case "completed":
                    return order.status === "completed";
                case "cancelled":
                    return order.status === "cancelled";
                default:
                    return false;
            }
        });
    }, [activeTab]);

    return (
        <View className="flex-1 bg-background-secondary">
            <OrdersHeader />
            <OrdersTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <OrdersList orders={filteredOrders} variant={activeTab} />
        </View>
    );
}
