import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'power': 'power',
  'cart.fill': 'shopping-cart',
} as IconMapping;

interface IconSymbolProps {
  readonly name: IconSymbolName;
  readonly size?: number;
  readonly color: string | OpaqueColorValue;
  readonly style?: StyleProp<TextStyle>;
}

export function IconSymbol(props: IconSymbolProps) {
  const { name, size = 24, color, style } = props;
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
