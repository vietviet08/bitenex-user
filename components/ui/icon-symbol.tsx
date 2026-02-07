import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

const MAPPING = {
    // Existing SF Symbol keys
    "house.fill": "home",
    "paperplane.fill": "send",
    "chevron.left.forwardslash.chevron.right": "code",
    "chevron.right": "chevron-right",
    "chevron.left": "chevron-left",
    power: "power",
    "cart.fill": "shopping-cart",
    // Tab bar icons
    home: "home",
    explore: "explore",
    "shopping-bag": "shopping-bag",
    "receipt-long": "receipt-long",
    person: "person",
    // Navigation & UI
    "location-on": "location-on",
    "expand-more": "expand-more",
    notifications: "notifications",
    search: "search",
    tune: "tune",
    favorite: "favorite",
    "favorite-border": "favorite-border",
    // Delivery & commerce
    "local-shipping": "local-shipping",
    sell: "sell",
    "delivery-dining": "delivery-dining",
    "lunch-dining": "lunch-dining",
    // Rating
    star: "star",
    "star-rate": "star-rate",
    // Restaurant detail
    "arrow-back": "arrow-back",
    "ios-share": "ios-share",
    add: "add",
    "arrow-forward": "arrow-forward",
    "local-offer": "local-offer",
    eco: "eco",
    remove: "remove",
    "expand-less": "expand-less",
    "credit-card": "credit-card",
    // Contact & Navigation
    phone: "phone",
    web: "language",
    "chevron-right": "chevron-right",
    directions: "directions",
    info: "info",
    // Misc
    bell: "notifications",
} as const satisfies Record<string, MaterialIconName>;

export type IconSymbolName = keyof typeof MAPPING;

interface IconSymbolProps {
    readonly name: IconSymbolName;
    readonly size?: number;
    readonly color: string | OpaqueColorValue;
    readonly style?: StyleProp<TextStyle>;
}

export function IconSymbol(props: IconSymbolProps) {
    const { name, size = 24, color, style } = props;
    return (
        <MaterialIcons
            color={color}
            size={size}
            name={MAPPING[name]}
            style={style}
        />
    );
}
