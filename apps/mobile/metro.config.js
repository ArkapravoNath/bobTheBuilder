const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// pnpm: watch the monorepo root so Metro sees workspace package changes
config.watchFolders = [workspaceRoot];

// pnpm: resolve packages from local node_modules first, then the hoisted
// workspace root. Local must be first so the app's pinned versions win.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm uses symlinks for every package — Metro must follow them or it will
// fail to resolve modules that live in the pnpm virtual store (.pnpm/).
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
