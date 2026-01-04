/**
 * Theme barrel export
 * Centralizes all design tokens
 */

export * from './colors';
export * from './spacing';
export * from './typography';

import { colors } from './colors';
import { spacing, borderRadius, iconSize } from './spacing';
import { textStyles, fontSize, fontWeight, lineHeight } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  iconSize,
  textStyles,
  fontSize,
  fontWeight,
  lineHeight,
} as const;

export type Theme = typeof theme;
