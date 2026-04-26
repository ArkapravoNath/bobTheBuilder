// Minimal Babel config for canvas unit tests (pure TS, no RN runtime needed).
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
