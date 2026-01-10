import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTypeClassName = () => {
    switch (type) {
      case 'default':
        return 'text-base';
      case 'defaultSemiBold':
        return 'text-base font-semibold';
      case 'title':
        return 'text-4xl font-bold';
      case 'subtitle':
        return 'text-xl font-bold';
      case 'link':
        return 'text-base';
      default:
        return 'text-base';
    }
  };

  const getTypeStyle = () => {
    switch (type) {
      case 'title':
        return { lineHeight: 32 };
      case 'link':
        return { lineHeight: 30, color: '#0a7ea4' };
      default:
        return undefined;
    }
  };

  return (
    <Text
      className={`${getTypeClassName()} ${className || ''}`}
      style={[
        { color: type === 'link' ? undefined : color },
        getTypeStyle(),
        style,
      ]}
      {...rest}
    />
  );
}
