import { TerminalTheme } from "../../../types";

/**
 * Color palette for terminal theme customization
 */
export interface ColorPalette {
  /**
   * Primary color scheme
   */
  primary: string;

  /**
   * Secondary color scheme
   */
  secondary: string;

  /**
   * Accent color for highlights
   */
  accent: string;

  /**
   * Color for success messages and indicators
   */
  success: string;

  /**
   * Color for warning messages and indicators
   */
  warning: string;

  /**
   * Color for error messages and indicators
   */
  error: string;

  /**
   * Color for command output
   */
  output: string;

  /**
   * Color for system messages
   */
  system: string;
}

/**
 * Theme customization options
 */
export interface ThemeCustomization {
  /**
   * Name of the theme
   */
  name: string;

  /**
   * Base theme to customize
   */
  baseTheme?: string;

  /**
   * Background color
   */
  background?: string;

  /**
   * Foreground color for text
   */
  foreground?: string;

  /**
   * Cursor color
   */
  cursor?: string;

  /**
   * Selection color
   */
  selection?: string;

  /**
   * Custom color palette
   */
  palette?: Partial<ColorPalette>;

  /**
   * Custom terminal colors
   */
  colors?: Partial<TerminalTheme>;
}

/**
 * Interface for theme manager
 */
export interface ThemeManager {
  /**
   * Get a theme by ID
   */
  getTheme(themeId: string): TerminalTheme;

  /**
   * Set the active theme
   */
  setTheme(themeId: string): void;

  /**
   * Get the currently active theme
   */
  getActiveTheme(): TerminalTheme;

  /**
   * Get the ID of the currently active theme
   */
  getActiveThemeId(): string;

  /**
   * Get all available themes
   */
  getAvailableThemes(): string[];

  /**
   * Create a custom theme based on an existing theme
   */
  createCustomTheme(customization: ThemeCustomization): string;

  /**
   * Save a custom theme
   */
  saveCustomTheme(theme: TerminalTheme, name: string): string;

  /**
   * Get the color palette for the current theme
   */
  getColorPalette(): ColorPalette;

  /**
   * Register a theme event listener
   */
  onThemeChange(callback: (theme: TerminalTheme) => void): void;

  /**
   * Remove a theme event listener
   */
  removeThemeChangeListener(callback: (theme: TerminalTheme) => void): void;
}
