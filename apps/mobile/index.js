// Entry point shim for expo-router.
//
// Expo CLI resolves the "main" field via path.resolve(projectRoot, main).
// A bare specifier like "expo-router/entry" is not a valid relative path, so
// path.resolve would produce apps/mobile/expo-router/entry (which does not
// exist) causing Expo to fall back to the legacy expo/AppEntry.js entry.
//
// Pointing "main" to this local file guarantees the path always resolves, and
// Metro then handles the module specifier import below using its own resolver
// (nodeModulesPaths + symlink-aware resolution for pnpm).
import 'expo-router/entry';
