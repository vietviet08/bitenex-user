import { View, ScrollView } from "react-native";

import {
    OverviewHeader,
    RestaurantInfoCard,
    ContactDetailsCard,
    OperatingHoursCard,
    LocationMap,
} from "@/components/restaurant-overview";

// Mock data - replace with actual data fetching
const MOCK_RESTAURANT = {
    id: "1",
    name: "Bella Italia",
    cuisine: "Italian",
    rating: 4.5,
    reviewCount: 324,
    isOpen: true,
    phone: "+1 (555) 123-4567",
    address: "123 Main Street\nNew York, NY 10001",
    website: "https://bellaitalia.com",
    hours: [
        { day: "Monday", open: "11:00 AM", close: "10:00 PM", isClosed: false },
        {
            day: "Tuesday",
            open: "11:00 AM",
            close: "10:00 PM",
            isClosed: false,
        },
        {
            day: "Wednesday",
            open: "11:00 AM",
            close: "10:00 PM",
            isClosed: false,
        },
        {
            day: "Thursday",
            open: "11:00 AM",
            close: "10:00 PM",
            isClosed: false,
        },
        { day: "Friday", open: "11:00 AM", close: "11:00 PM", isClosed: false },
        {
            day: "Saturday",
            open: "10:00 AM",
            close: "11:00 PM",
            isClosed: false,
        },
        { day: "Sunday", open: "10:00 AM", close: "9:00 PM", isClosed: false },
    ],
    coordinates: {
        latitude: 15.976605095453037,
        longitude: 108.1876428258775,
    },
};

export default function RestaurantOverviewScreen() {
    return (
        <View className="flex-1 bg-white">
            <OverviewHeader title="Restaurant Info" />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <RestaurantInfoCard
                    name={MOCK_RESTAURANT.name}
                    cuisine={MOCK_RESTAURANT.cuisine}
                    rating={MOCK_RESTAURANT.rating}
                    reviewCount={MOCK_RESTAURANT.reviewCount}
                    isOpen={MOCK_RESTAURANT.isOpen}
                />

                <View className="h-2 bg-neutral-100" />

                <ContactDetailsCard
                    phone={MOCK_RESTAURANT.phone}
                    address={MOCK_RESTAURANT.address}
                    website={MOCK_RESTAURANT.website}
                />

                <View className="h-2 bg-neutral-100" />

                <OperatingHoursCard hours={MOCK_RESTAURANT.hours} />

                <View className="h-2 bg-neutral-100" />

                <LocationMap
                    address={MOCK_RESTAURANT.address}
                    coordinates={MOCK_RESTAURANT.coordinates}
                />
            </ScrollView>
        </View>
    );
}
