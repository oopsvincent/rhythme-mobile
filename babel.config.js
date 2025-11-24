// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Expo preset, with NativeWind as the JSX source
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // NativeWind babel preset (NOT in `plugins`)
      "nativewind/babel",
    ],
    // For Expo SDK 54 you generally don't need to add any extra plugins here.
    // `react-native-worklets/plugin` is auto-added by babel-preset-expo if needed.
    plugins: [],
  };
};
