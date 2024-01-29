import { createStitches } from "@stitches/react";

export const {
  config,
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
} = createStitches({
  theme: {
    colors: {
      "green-dark": "#015F43",
      green: "#00875F",
      "green-light": "#00B37E",
      blue: "#81D8F7",
      warning: "#FBA94C",
      "red-error": "#F75A68",
      "gray-900": "#09090A",
      "gray-800": "#121214",
      "gray-700": "#323238",
      "gray-100": "#E1E1E6",
      "gray-200": "#C4C4CC",
      "gray-300": "#8D8D99",
      white: "#FFFFFF",
    },
  },
});
