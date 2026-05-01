/**
 * withStoryWrapper — HOC decorator factory for Build Buddy stories.
 *
 * Usage (per-story metadata):
 *
 *   import { withStoryWrapper } from '../hoc/withStoryWrapper';
 *
 *   export default {
 *     title: 'Components/BuddyButton',
 *     component: BuddyButton,
 *     decorators: [withStoryWrapper()],            // cream bg, 16px padding
 *   } satisfies Meta<typeof BuddyButton>;
 *
 *   // Dark toolbar, no padding, full screen:
 *   decorators: [withStoryWrapper({ bg: 'dark', padding: 0, fill: true })]
 *
 *   // Centred on a white card:
 *   decorators: [withStoryWrapper({ bg: 'white', centered: true })]
 *
 * The wrapper automatically provides:
 *   GestureHandlerRootView · SafeAreaProvider · TamaguiProvider · QueryClientProvider
 *
 * Adding a new screen story is a one-liner:
 *   decorators: [withStoryWrapper({ bg: 'dark', fill: true })]
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TamaguiProvider } from '@tamagui/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decorator } from '@storybook/react-native';
import tamaguiConfig from '../../theme/tamagui.config';

// ── Types ──────────────────────────────────────────────────────────────────────

export type StoryBackground = 'cream' | 'dark' | 'white' | 'canvas' | 'surface';

export interface StoryWrapperConfig {
  /** Background colour of the story container. Default: 'cream'. */
  bg?: StoryBackground;
  /** Inner padding. Pass 0 for edge-to-edge (full-screen) stories. Default: 16. */
  padding?: number;
  /** If true the story fills the entire screen (flex: 1). Default: false. */
  fill?: boolean;
  /** If true the story is centred vertically and horizontally. Default: false. */
  centered?: boolean;
  /** Tamagui theme override. Default: 'light'. */
  theme?: 'light' | 'dark';
}

// ── Singleton QueryClient for stories (no retries, infinite stale time) ──────

const storyQueryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: false, staleTime: Infinity, gcTime: Infinity },
    mutations: { retry: false },
  },
});

// ── Background token map ──────────────────────────────────────────────────────

const BG: Record<StoryBackground, string> = {
  cream:   '#F5F2EC',
  dark:    '#1C1917',
  white:   '#FFFFFF',
  canvas:  '#E8E4DE',
  surface: '#F8F6F2',
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function withStoryWrapper(config: StoryWrapperConfig = {}): Decorator {
  const {
    bg       = 'cream',
    padding  = 16,
    fill     = false,
    centered = false,
    theme    = 'light',
  } = config;

  const bgColor = BG[bg];

  return function StoryDecorator(Story) {
    return (
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <QueryClientProvider client={storyQueryClient}>
          <View
            style={[
              styles.root,
              { backgroundColor: bgColor, padding },
              fill && styles.fill,
              centered && styles.centered,
            ]}
          >
            <Story />
          </View>
        </QueryClientProvider>
      </TamaguiProvider>
    );
  };
}

// ── Convenience presets (import and use directly as a decorator) ──────────────

/** Cream background, 16px padding — good for most UI components. */
export const withDefault = withStoryWrapper();

/** Dark charcoal background — good for toolbar/banner components. */
export const withDark = withStoryWrapper({ bg: 'dark', padding: 0, fill: true });

/** Edge-to-edge, cream background — good for full-screen screen stories. */
export const withFullScreen = withStoryWrapper({ bg: 'cream', padding: 0, fill: true });

/** White surface, centred content — good for cards and modals. */
export const withCenteredCard = withStoryWrapper({ bg: 'white', centered: true });

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
