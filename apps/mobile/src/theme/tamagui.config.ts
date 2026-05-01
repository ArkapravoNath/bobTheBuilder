import { createTamagui, createTokens, createTheme, createFont } from '@tamagui/core';
import { shorthands } from '@tamagui/shorthands';
import { createAnimations } from '@tamagui/animations-react-native';

const animations = createAnimations({
  fast: { type: 'spring', damping: 20, mass: 1, stiffness: 250 },
  medium: { type: 'spring', damping: 18, mass: 1, stiffness: 180 },
  slow: { type: 'spring', damping: 16, mass: 1, stiffness: 120 },
});

const tokens = createTokens({
  color: {
    // Teak / amber accent
    teak50: '#FDF6EE', teak100: '#F5E8D4', teak200: '#E8CEAD',
    teak300: '#D4AA7E', teak400: '#C08B55', teak500: '#A06A3A',
    teak600: '#855630', teak700: '#6B4226', teak800: '#522F1C', teak900: '#3A1F10',

    // Charcoal / warm gray
    charcoal900: '#1C1917', charcoal800: '#2A2825', charcoal700: '#3D3A37',
    charcoal600: '#4A4744', charcoal400: '#8A857C', charcoal200: '#C4C0BA',
    charcoal100: '#E5E0D8', charcoal50:  '#F5F2EC',

    // Cream surfaces
    creamBg:     '#F5F2EC',
    creamSurface:'#FFFFFF',
    creamRaised: '#FDFCF9',
    creamBorder: '#E5E0D8',

    // Keep blue for data viz only
    blue500: '#1E6FD9', blue100: '#EBF2FC',

    // Status
    success: '#2D7A4F',
    error:   '#C0392B',
    warning: '#D97706',

    // Helpers
    white: '#FFFFFF', black: '#000000', transparent: 'rgba(0,0,0,0)',
  },
  space: {
    $true: 16,
    $1: 4, $2: 8, $3: 12, $4: 16, $5: 20, $6: 24, $8: 32, $10: 40, $12: 48, $16: 64,
  },
  size: {
    $true: 44,
    $1: 20, $2: 28, $3: 36, $4: 44, $5: 52, $6: 60, $8: 80, $10: 100,
  },
  radius: {
    $true: 8,
    $0: 0, $sm: 4, $md: 8, $lg: 12, $xl: 16, $2xl: 24, $full: 9999,
  },
  zIndex: { $0: 0, $1: 100, $2: 200, $3: 300, $4: 400, $5: 500 },
});

const interFont = createFont({
  family: 'Inter, system-ui, sans-serif',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 30, 8: 36, 9: 48 },
  lineHeight: { 1: 16, 2: 20, 3: 24, 4: 28, 5: 28, 6: 32, 7: 36, 8: 44, 9: 60 },
  weight: { 1: '400', 4: '400', 5: '500', 6: '600', 7: '700', 8: '800' },
  letterSpacing: { 1: 0, 4: 0, 8: -0.5 },
});

const headingFont = createFont({
  family: 'Georgia, serif',
  size: { 1: 18, 2: 22, 3: 28, 4: 36, 5: 48, 6: 56 },
  lineHeight: { 1: 24, 2: 28, 3: 36, 4: 44, 5: 58, 6: 66 },
  weight: { 1: '400', 4: '600', 6: '700' },
  letterSpacing: { 1: -0.2, 4: -0.4 },
});

const lightTheme = createTheme({
  background:            tokens.color.creamBg,
  backgroundHover:       tokens.color.charcoal50,
  backgroundPress:       tokens.color.charcoal100,
  backgroundStrong:      tokens.color.creamSurface,
  backgroundTransparent: tokens.color.transparent,

  borderColor:      tokens.color.creamBorder,
  borderColorHover: tokens.color.charcoal200,
  borderColorFocus: tokens.color.teak500,

  color:            tokens.color.charcoal900,
  colorHover:       tokens.color.charcoal800,
  colorTransparent: tokens.color.transparent,
  placeholderColor: tokens.color.charcoal200,
  outlineColor:     tokens.color.transparent,
  shadowColor:      'rgba(28,25,23,0.10)',
  shadowColorHover: 'rgba(28,25,23,0.16)',

  // Semantic
  primary:       tokens.color.charcoal900,  // dark CTA
  primaryHover:  tokens.color.charcoal800,
  primaryPress:  tokens.color.charcoal700,

  accent:        tokens.color.teak500,      // teak links / selected
  accentHover:   tokens.color.teak600,
  accentLight:   tokens.color.teak100,

  muted:         tokens.color.charcoal400,
  surface:       tokens.color.creamSurface,
  surfaceMuted:  tokens.color.creamRaised,

  success: tokens.color.success,
  warning: tokens.color.warning,
  error:   tokens.color.error,
});

const config = createTamagui({
  animations,
  shouldAddPrefersColorTheme: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: { body: interFont, heading: headingFont },
  themes: { light: lightTheme },
  tokens,
  media: {
    xs: { maxWidth: 660 }, sm: { maxWidth: 800 }, md: { maxWidth: 1020 },
    gtXs: { minWidth: 661 }, gtSm: { minWidth: 801 }, gtMd: { minWidth: 1021 },
    short: { maxHeight: 820 }, tall: { minHeight: 820 },
    hoverNone: { hover: 'none' }, pointerCoarse: { pointer: 'coarse' },
  },
  settings: { allowedStyleValues: 'somewhat-strict' },
});

export type AppConfig = typeof config;
declare module '@tamagui/core' { interface TamaguiCustomConfig extends AppConfig {} }
export default config;
