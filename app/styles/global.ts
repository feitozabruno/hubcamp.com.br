import { globalCss } from "./stitches.config";

export const globalStyles = globalCss({
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },

  "body, button, input, textarea": {
    fontFamily: "var(--font-roboto)",
    "-webkit-font-smoothing": "antialiased",
  },

  ":focus": {
    outline: 0,
    "box-shadow": "0 0 0 2px $green-light",
  },
});
