const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so Metro picks up changes in packages/shared
config.watchFolders = [workspaceRoot];

// Resolve packages from the app first, then the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Map the workspace package to its TypeScript source
config.resolver.extraNodeModules = {
  '@drafts-io/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './app/global.css',
});