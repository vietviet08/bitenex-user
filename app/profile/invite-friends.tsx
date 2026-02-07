import React, { useState, useCallback } from "react";
import { View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ScreenHeader, ContactListItem } from "@/components/profile";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Contact {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    isInvited: boolean;
}

const MOCK_CONTACTS: Contact[] = [
    {
        id: "1",
        name: "John Doe",
        phone: "+1 234 567 8901",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        isInvited: false,
    },
    {
        id: "2",
        name: "Jane Smith",
        phone: "+1 234 567 8902",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        isInvited: true,
    },
    {
        id: "3",
        name: "Bob Wilson",
        phone: "+1 234 567 8903",
        isInvited: false,
    },
    {
        id: "4",
        name: "Alice Brown",
        phone: "+1 234 567 8904",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        isInvited: false,
    },
    {
        id: "5",
        name: "Charlie Davis",
        phone: "+1 234 567 8905",
        isInvited: true,
    },
];

export default function InviteFriendsScreen() {
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const [searchQuery, setSearchQuery] = useState("");

    const handleInvite = useCallback((id: string) => {
        setContacts((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isInvited: true } : c))
        );
    }, []);

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = useCallback(
        ({ item }: { item: Contact }) => (
            <ContactListItem
                id={item.id}
                name={item.name}
                phone={item.phone}
                avatarUrl={item.avatarUrl}
                isInvited={item.isInvited}
                onInvite={handleInvite}
            />
        ),
        [handleInvite]
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Invite Friends" />

            {/* Search */}
            <View className="px-6 py-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <IconSymbol name="search" size={20} color="#9e9e9e" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search contacts"
                        placeholderTextColor="#9e9e9e"
                        className="flex-1 ml-3 text-base text-text-primary"
                    />
                </View>
            </View>

            <FlashList
                data={filteredContacts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={72}
            />
        </SafeAreaView>
    );
}
