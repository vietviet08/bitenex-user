/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#FFF5F0',
          100: '#FFEBE0',
          200: '#FFD1B8',
          300: '#FFB78F',
          400: '#FF9D66',
          500: '#FF6B35', // Main brand color
          600: '#E55A2B',
          700: '#CC4A22',
          800: '#993718',
          900: '#66250F',
        },
        // Secondary accent colors
        secondary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // Success green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Neutral grays
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Semantic colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Background variants
        background: {
          primary: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#FAFAFA',
        },
        // Text colors
        text: {
          primary: '#171717',
          secondary: '#525252',
          tertiary: '#737373',
          inverse: '#FFFFFF',
          disabled: '#A3A3A3',
        },
        // Border colors
        border: {
          light: '#E5E5E5',
          medium: '#D4D4D4',
          dark: '#A3A3A3',
        },
        // Overlay
        overlay: 'rgba(0, 0, 0, 0.5)',
        // Transparent
        transparent: 'transparent',
      },
      spacing: {
        none: 0,
        '2xs': 2,
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
        '5xl': 48,
        '6xl': 64,
      },
      borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        full: 9999,
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }], // 12 * 1.5
        sm: ['14px', { lineHeight: '21px' }], // 14 * 1.5
        base: ['16px', { lineHeight: '24px' }], // 16 * 1.5
        lg: ['18px', { lineHeight: '27px' }], // 18 * 1.5
        xl: ['20px', { lineHeight: '25px' }], // 20 * 1.25
        '2xl': ['24px', { lineHeight: '30px' }], // 24 * 1.25
        '3xl': ['30px', { lineHeight: '37.5px' }], // 30 * 1.25
        '4xl': ['36px', { lineHeight: '45px' }], // 36 * 1.25
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      iconSize: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 40,
      },
    },
  },
  plugins: [],
};
