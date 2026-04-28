const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Let Metro know where to resolve packages from
    disableHierarchicalLookup: true,
    // Support .lottie (dotLottie binary) animation files
    assetExts: [...(defaultConfig.resolver?.assetExts || []), 'lottie'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
