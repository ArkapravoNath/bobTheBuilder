module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === 'test';
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Tamagui compile-time extraction is only needed for dev/prod builds.
      // Keep @tamagui/babel-plugin declared in devDependencies because Metro
      // resolves this plugin when bundling Android/iOS.
      ...(isTest
        ? []
        : [
            [
              '@tamagui/babel-plugin',
              {
                components: ['tamagui'],
                config: './src/theme/tamagui.config.ts',
                logTimings: true,
                disableExtraction: process.env.NODE_ENV === 'development',
              },
            ],
          ]),
      'react-native-reanimated/plugin',
    ],
  };
};
