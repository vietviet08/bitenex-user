import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader, FAQAccordion, ContactCard } from "@/components/profile";

const FAQ_DATA = [
    {
        question: "How do I place an order?",
        answer:
            "Browse restaurants, add items to your cart, and proceed to checkout. You can pay with various methods including credit card and digital wallets.",
    },
    {
        question: "How can I track my order?",
        answer:
            "After placing an order, you can track it in real-time from the Orders tab. You'll see the status updates and estimated delivery time.",
    },
    {
        question: "What payment methods are accepted?",
        answer:
            "We accept credit/debit cards (Visa, Mastercard, Amex), digital wallets (Apple Pay, Google Pay), and cash on delivery in select areas.",
    },
    {
        question: "How do I cancel an order?",
        answer:
            "Go to Orders > Active Orders, select the order you want to cancel, and tap 'Cancel Order'. Cancellation may not be available after the restaurant starts preparing.",
    },
    {
        question: "How do refunds work?",
        answer:
            "Refunds are processed within 5-7 business days to your original payment method. You'll receive an email confirmation when the refund is initiated.",
    },
];

export default function HelpCenterScreen() {
    const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ScreenHeader title="Help Center" />

            {/* Tabs */}
            <View className="flex-row px-6 py-2">
                <Pressable
                    onPress={() => setActiveTab("faq")}
                    className={`flex-1 py-3 items-center rounded-full ${activeTab === "faq" ? "bg-primary-500" : "bg-gray-100"
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "faq"
                                ? "text-white"
                                : "text-text-primary"
                            }`}
                    >
                        FAQ
                    </Text>
                </Pressable>
                <View className="w-3" />
                <Pressable
                    onPress={() => setActiveTab("contact")}
                    className={`flex-1 py-3 items-center rounded-full ${activeTab === "contact"
                            ? "bg-primary-500"
                            : "bg-gray-100"
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "contact"
                                ? "text-white"
                                : "text-text-primary"
                            }`}
                    >
                        Contact Us
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {activeTab === "faq" ? (
                    <View className="py-4">
                        {FAQ_DATA.map((item, index) => (
                            <FAQAccordion
                                key={index}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </View>
                ) : (
                    <View className="px-6 py-4 space-y-3">
                        <ContactCard
                            icon="phone"
                            title="Customer Service"
                            subtitle="Call us 24/7"
                            onPress={() => console.log("Call")}
                        />
                        <View className="h-3" />
                        <ContactCard
                            icon="chat"
                            title="WhatsApp"
                            subtitle="Chat with us"
                            onPress={() => console.log("WhatsApp")}
                        />
                        <View className="h-3" />
                        <ContactCard
                            icon="email"
                            title="Email"
                            subtitle="support@bitenex.com"
                            onPress={() => console.log("Email")}
                        />
                        <View className="h-3" />
                        <ContactCard
                            icon="web"
                            title="Website"
                            subtitle="www.bitenex.com"
                            onPress={() => console.log("Website")}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
