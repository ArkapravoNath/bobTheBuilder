import { getStorybookUI } from '@storybook/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Registers all stories — re-run `pnpm storybook:gen` after adding new story files
import './storybook.requires';

/**
 * StorybookUI: rendered instead of the normal app when EXPO_PUBLIC_STORYBOOK=true.
 * Run `pnpm storybook:web` to open the same story surface in a browser.
 */
export default getStorybookUI({
  asyncStorage: AsyncStorage,
  onDeviceUI: true,
  shouldPersistSelection: true,
});
