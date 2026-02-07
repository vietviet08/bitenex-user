/**
 * Color palette for the Bitenex User App
 * Primary: Brand colors
 * Semantic: Success, Warning, Error states
 * Neutral: Grays for text and backgrounds
 */

export const colors = {
    // Brand colors (green - matches tailwind primary)
    primary: {
        50: "#F0FDF4",
        100: "#DCFCE7",
        200: "#BBF7D0",
        300: "#86EFAC",
        400: "#4ADE80",
        500: "#22C55E", // Main brand green
        600: "#16A34A",
        700: "#15803D",
        800: "#166534",
        900: "#14532D",
    },

    // Secondary accent (orange)
    secondary: {
        50: "#FFF5F0",
        100: "#FFEBE0",
        200: "#FFD1B8",
        300: "#FFB78F",
        400: "#FF9D66",
        500: "#FF6B35", // Accent orange
        600: "#E55A2B",
        700: "#CC4A22",
        800: "#993718",
        900: "#66250F",
    },

    // Neutral grays
    neutral: {
        0: "#FFFFFF",
        50: "#FAFAFA",
        100: "#F5F5F5",
        200: "#E5E5E5",
        300: "#D4D4D4",
        400: "#A3A3A3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717",
    },

    // Semantic colors
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Background variants
    background: {
        primary: "#FFFFFF",
        secondary: "#F5F5F5",
        tertiary: "#FAFAFA",
    },

    // Text colors
    text: {
        primary: "#171717",
        secondary: "#525252",
        tertiary: "#737373",
        inverse: "#FFFFFF",
        disabled: "#A3A3A3",
    },

    // Border colors
    border: {
        light: "#E5E5E5",
        medium: "#D4D4D4",
        dark: "#A3A3A3",
    },

    // Overlay
    overlay: "rgba(0, 0, 0, 0.5)",

    // Transparent
    transparent: "transparent",
} as const;

export type ColorKey = keyof typeof colors;
