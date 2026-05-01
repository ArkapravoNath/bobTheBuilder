import type { Preview } from '@storybook/react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Minimal global wrapping — stories use withStoryWrapper for richer control
const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream',  value: '#F5F2EC' },
        { name: 'white',  value: '#FFFFFF'  },
        { name: 'dark',   value: '#1C1917'  },
        { name: 'canvas', value: '#E8E4DE'  },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    notes: {
      // Per-story notes can override the global note key
      global: '### Build Buddy Storybook\n\nAll stories run live in Expo Go. Use the Controls panel to adjust props.',
    },
  },
  decorators: [
    (Story) => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Story />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    ),
  ],
};

export default preview;
