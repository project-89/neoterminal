import { TerminalTheme } from "../../../types";

/**
 * Cyberpunk terminal theme with neon colors
 */
export const cyberpunkTheme: TerminalTheme = {
  background: "#0C0D16", // Deep dark background
  foreground: "#E8E8E8", // Bright text for contrast
  cursor: "#FF00FF", // Neon magenta cursor
  selection: "#363636", // Subtle selection

  // Standard colors
  black: "#131721",
  red: "#FC2A54", // Neon red
  green: "#00FF9C", // Neon green
  yellow: "#FFD400", // Bright yellow
  blue: "#00BFFF", // Cyan blue
  magenta: "#FF00FF", // Neon magenta
  cyan: "#00FFFF", // Neon cyan
  white: "#E8E8E8", // Off-white

  // Bright variants
  brightBlack: "#565656",
  brightRed: "#FF5370",
  brightGreen: "#50FFA0",
  brightYellow: "#FFEE80",
  brightBlue: "#50C8FF",
  brightMagenta: "#FF70FF",
  brightCyan: "#80FFEA",
  brightWhite: "#FFFFFF",
};
