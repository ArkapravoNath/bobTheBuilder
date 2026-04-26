import { createTamagui, createTokens, createTheme, createFont } from '@tamagui/core';
import { shorthands } from '@tamagui/shorthands';
import { animations } from '@tamagui/animations-react-native';

// ── Tokens (sourced from design tokens — run `pnpm tokens:sync` to regenerate) ──

const tokens = createTokens({
  color: {
    // Brand blues
    buddyBlue50:  '#EBF2FC',
    buddyBlue100: '#C3D9F7',
    buddyBlue200: '#9AC0F2',
    buddyBlue300: '#71A7ED',
    buddyBlue400: '#4A8EE8',
    buddyBlue500: '#1E6FD9',
    buddyBlue600: '#185BB5',
    buddyBlue700: '#124791',
    buddyBlue800: '#0C336D',
    buddyBlue900: '#071F49',

    // Brass accent
    buddyBrass500: '#A06A3A',
    buddyBrass600: '#855630',
    buddyBrass700: '#6B4326',

    // Cream background palette
    buddyCream50:  '#FBFAF7',
    buddyCream100: '#F5F2EC',
    buddyCream200: '#EDE8DE',
    buddyCream300: '#E8E2D7',

    // Ink (text)
    buddyInk900: '#2A2825',
    buddyInk600: '#4A4744',
    buddyInk400: '#8A857C',
    buddyInk200: '#C4C0BA',

    // Semantic
    white: '#FFFFFF',
    black: '#000000',
    success: '#27AE60',
    warning: '#F39C12',
    error:   '#E74C3C',

    // Transparent
    transparent: 'rgba(0,0,0,0)',
  },
  space: {
    $true: 16,
    $1: 4,
    $2: 8,
    $3: 12,
    $4: 16,
    $5: 20,
    $6: 24,
    $8: 32,
    $10: 40,
    $12: 48,
    $16: 64,
  },
  size: {
    $true: 44,
    $1: 20,
    $2: 28,
    $3: 36,
    $4: 44,
    $5: 52,
    $6: 60,
    $8: 80,
    $10: 100,
    $12: 120,
  },
  radius: {
    $true: 8,
    $0: 0,
    $sm: 4,
    $md: 8,
    $lg: 12,
    $xl: 16,
    $2xl: 24,
    $full: 9999,
  },
  zIndex: {
    $0: 0,
    $1: 100,
    $2: 200,
    $3: 300,
    $4: 400,
    $5: 500,
  },
});

// ── Fonts ─────────────────────────────────────────────────────────────────────

const interFont = createFont({
  family: 'Inter, system-ui, sans-serif',
  size: {
    1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 30, 8: 36, 9: 48,
  },
  lineHeight: {
    1: 16, 2: 20, 3: 24, 4: 28, 5: 28, 6: 32, 7: 36, 8: 44, 9: 60,
  },
  weight: {
    1: '400',
    4: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
  },
  letterSpacing: {
    1: 0, 4: 0, 8: -0.5,
  },
});

const headingFont = createFont({
  family: 'Cormorant Garamond, serif',
  size: {
    1: 18, 2: 22, 3: 28, 4: 36, 5: 48, 6: 56,
  },
  lineHeight: {
    1: 22, 2: 28, 3: 34, 4: 44, 5: 56, 6: 64,
  },
  weight: {
    1: '500',
    4: '600',
    6: '700',
  },
  letterSpacing: {
    1: 0, 4: -0.3,
  },
});

// ── Light Theme ───────────────────────────────────────────────────────────────

const lightTheme = createTheme({
  background:           tokens.color.buddyCream50,
  backgroundHover:      tokens.color.buddyCream100,
  backgroundPress:      tokens.color.buddyCream200,
  backgroundFocus:      tokens.color.buddyCream100,
  backgroundStrong:     tokens.color.white,
  backgroundTransparent: tokens.color.transparent,

  borderColor:          tokens.color.buddyCream300,
  borderColorHover:     tokens.color.buddyInk200,
  borderColorFocus:     tokens.color.buddyBlue500,
  borderColorPress:     tokens.color.buddyBlue700,

  color:                tokens.color.buddyInk900,
  colorHover:           tokens.color.buddyInk600,
  colorPress:           tokens.color.buddyInk900,
  colorFocus:           tokens.color.buddyInk900,
  colorTransparent:     tokens.color.transparent,

  placeholderColor:     tokens.color.buddyInk200,
  outlineColor:         tokens.color.transparent,

  shadowColor:          'rgba(42,40,37,0.12)',
  shadowColorHover:     'rgba(42,40,37,0.16)',

  // Custom semantic tokens
  primary:              tokens.color.buddyBlue500,
  primaryHover:         tokens.color.buddyBlue600,
  primaryPress:         tokens.color.buddyBlue700,

  accent:               tokens.color.buddyBrass500,
  accentHover:          tokens.color.buddyBrass600,

  muted:                tokens.color.buddyInk400,
  surface:              tokens.color.white,
  surfaceMuted:         tokens.color.buddyCream100,

  success:              tokens.color.success,
  warning:              tokens.color.warning,
  error:                tokens.color.error,
});

// ── Config ────────────────────────────────────────────────────────────────────

const config = createTamagui({
  animations,
  shouldAddPrefersColorTheme: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    body: interFont,
    heading: headingFont,
  },
  themes: {
    light: lightTheme,
  },
  tokens,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1650 },
    xxl: { minWidth: 1651 },
    gtXs: { minWidth: 661 },
    gtSm: { minWidth: 801 },
    gtMd: { minWidth: 1021 },
    gtLg: { minWidth: 1281 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
  settings: {
    allowedStyleValues: 'somewhat-strict',
    autocompleteSpecificTokens: 'except-special',
  },
});

export type AppConfig = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
