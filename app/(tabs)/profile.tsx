import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import {
    ProfileHeader,
    SettingsSection,
    SettingsMenuItem,
} from "@/components/profile";


export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    logout().catch((err) => {
                        console.error("Logout failed", err);
                    });
                },
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center gap-3 px-6 py-4">
                    <View className="bg-primary-100 p-1.5 rounded-full">
                        <View className="w-5 h-5 items-center justify-center">
                            <View className="w-3 h-3 bg-primary-500 rounded-full" />
                        </View>
                    </View>
                    <View>
                        <View className="text-2xl font-bold">
                            {/* Profile title handled by ProfileHeader */}
                        </View>
                    </View>
                </View>

                {/* Profile Header */}
                <ProfileHeader
                    avatarUrl={user?.avatar_url ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                    name={user?.full_name ?? "Guest"}
                    phone={user?.phone ?? "No phone number"}
                />

                {/* Divider */}
                <View className="h-px bg-gray-100 mx-6 my-4" />

                {/* Settings Menu */}
                <View className="px-6">
                    <SettingsSection>
                        <SettingsMenuItem
                            icon="favorite"
                            label="My Favorite Restaurants"
                            href="/profile/favorites"
                        />
                        <SettingsMenuItem
                            icon="local-offer"
                            label="Special Offers & Promo"
                            href="/profile/promos"
                        />
                        <SettingsMenuItem
                            icon="wallet"
                            label="Payment Methods"
                            href="/profile/payment-methods"
                        />
                    </SettingsSection>

                    <View className="h-4" />

                    <SettingsSection>
                        <SettingsMenuItem
                            icon="person"
                            label="Profile"
                            href="/profile/edit"
                        />
                        <SettingsMenuItem
                            icon="location-on"
                            label="Address"
                            href="/profile/addresses"
                        />
                        <SettingsMenuItem
                            icon="notifications"
                            label="Notification"
                            href="/profile/notifications"
                        />
                        <SettingsMenuItem
                            icon="security"
                            label="Security"
                            href="/profile/security"
                        />
                    </SettingsSection>

                    <View className="h-4" />

                    <SettingsSection>
                        <SettingsMenuItem
                            icon="language"
                            label="Language"
                            href="/profile/language"
                            rightText="English (US)"
                        />
                    </SettingsSection>

                    <View className="h-4" />

                    <SettingsSection>
                        <SettingsMenuItem
                            icon="info"
                            label="Help Center"
                            href="/profile/help-center"
                        />
                        <SettingsMenuItem
                            icon="people-outline"
                            label="Invite Friends"
                            href="/profile/invite-friends"
                        />
                    </SettingsSection>

                    <View className="h-2" />

                    <SettingsMenuItem
                        icon="logout"
                        label="Logout"
                        onPress={handleLogout}
                        isDestructive
                    />
                </View>

                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}
