// Learn more: https://docs.expo.dev/guides/customizing-metro/
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Path aliases — match tsconfig.json "@/*" → "./src/*"
config.resolver.alias = {
  '@': path.resolve(projectRoot, 'src'),
};

// `pdf-lib` ships ESM that does `import { __extends } from 'tslib'`. Metro's
// package-exports resolution picks tslib's CJS build and applies a `.default`
// interop that leaves the helpers undefined ("Cannot destructure property
// '__extends' of 'tslib.default'"). Force tslib to its ES module build so the
// named imports bind correctly.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return context.resolveRequest(context, 'tslib/tslib.es6.js', platform);
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
