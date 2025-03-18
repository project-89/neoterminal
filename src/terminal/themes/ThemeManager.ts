import { TerminalTheme } from "../../../types";
import {
  ColorPalette,
  ThemeCustomization,
  ThemeManager as IThemeManager,
} from "./types";
import { cyberpunkTheme } from "./cyberpunk";
import EventEmitter from "events";

/**
 * ThemeManager implementation for terminal theme management
 */
export class ThemeManagerImpl extends EventEmitter implements IThemeManager {
  private themes: Map<string, TerminalTheme> = new Map();
  private activeThemeId: string = "cyberpunk";
  private colorPalettes: Map<string, ColorPalette> = new Map();

  /**
   * Initialize the theme manager with default themes
   */
  constructor() {
    super();

    // Register built-in themes
    this.registerTheme(
      "cyberpunk",
      cyberpunkTheme,
      this.extractPalette(cyberpunkTheme)
    );

    // Register other themes
    this.registerBuiltInThemes();
  }

  /**
   * Get a theme by ID
   */
  public getTheme(themeId: string): TerminalTheme {
    const theme = this.themes.get(themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not found, using default theme`);
      return this.getActiveTheme();
    }
    return { ...theme }; // Return a copy to prevent modification
  }

  /**
   * Set the active theme
   */
  public setTheme(themeId: string): void {
    if (!this.themes.has(themeId)) {
      console.warn(`Theme ${themeId} not found, using current theme`);
      return;
    }

    this.activeThemeId = themeId;

    // Emit theme change event
    this.emit("themeChange", this.getActiveTheme());
  }

  /**
   * Get the currently active theme
   */
  public getActiveTheme(): TerminalTheme {
    return { ...this.themes.get(this.activeThemeId)! };
  }

  /**
   * Get the ID of the currently active theme
   */
  public getActiveThemeId(): string {
    return this.activeThemeId;
  }

  /**
   * Get all available themes
   */
  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Create a custom theme based on an existing theme
   */
  public createCustomTheme(customization: ThemeCustomization): string {
    const baseThemeId = customization.baseTheme || this.activeThemeId;
    const baseTheme = this.getTheme(baseThemeId);

    // Generate theme ID based on name
    const themeId = customization.name.toLowerCase().replace(/\s+/g, "_");

    // Create new theme by merging base theme with customizations
    const newTheme: TerminalTheme = {
      ...baseTheme,
      ...customization.colors,
    };

    // Apply specific customizations
    if (customization.background) {
      newTheme.background = customization.background;
    }

    if (customization.foreground) {
      newTheme.foreground = customization.foreground;
    }

    if (customization.cursor) {
      newTheme.cursor = customization.cursor;
    }

    if (customization.selection) {
      newTheme.selection = customization.selection;
    }

    // Extract color palette
    const basePalette =
      this.colorPalettes.get(baseThemeId) || this.getDefaultPalette();
    const newPalette: ColorPalette = {
      ...basePalette,
      ...customization.palette,
    };

    // Register the new theme
    this.registerTheme(themeId, newTheme, newPalette);

    return themeId;
  }

  /**
   * Save a custom theme
   */
  public saveCustomTheme(theme: TerminalTheme, name: string): string {
    const themeId = name.toLowerCase().replace(/\s+/g, "_");

    // Extract palette
    const palette = this.extractPalette(theme);

    // Register the theme
    this.registerTheme(themeId, theme, palette);

    return themeId;
  }

  /**
   * Get the color palette for the current theme
   */
  public getColorPalette(): ColorPalette {
    return {
      ...(this.colorPalettes.get(this.activeThemeId) ||
        this.getDefaultPalette()),
    };
  }

  /**
   * Register a theme event listener
   */
  public onThemeChange(callback: (theme: TerminalTheme) => void): void {
    this.on("themeChange", callback);
  }

  /**
   * Remove a theme event listener
   */
  public removeThemeChangeListener(
    callback: (theme: TerminalTheme) => void
  ): void {
    this.removeListener("themeChange", callback);
  }

  /**
   * Register a theme
   * @private
   */
  private registerTheme(
    id: string,
    theme: TerminalTheme,
    palette: ColorPalette
  ): void {
    this.themes.set(id, { ...theme });
    this.colorPalettes.set(id, { ...palette });
  }

  /**
   * Extract a color palette from a theme
   * @private
   */
  private extractPalette(theme: TerminalTheme): ColorPalette {
    return {
      primary: theme.cyan,
      secondary: theme.blue,
      accent: theme.magenta,
      success: theme.green,
      warning: theme.yellow,
      error: theme.red,
      output: theme.white,
      system: theme.brightCyan,
    };
  }

  /**
   * Get the default color palette
   * @private
   */
  private getDefaultPalette(): ColorPalette {
    return {
      primary: "#00FFFF", // Cyan
      secondary: "#0088FF", // Blue
      accent: "#FF00FF", // Magenta
      success: "#00FF00", // Green
      warning: "#FFFF00", // Yellow
      error: "#FF0000", // Red
      output: "#FFFFFF", // White
      system: "#00FFFF", // Cyan
    };
  }

  /**
   * Register built-in themes
   * @private
   */
  private registerBuiltInThemes(): void {
    // Neon Night theme
    const neonNightTheme: TerminalTheme = {
      background: "#0A0A1C", // Deep midnight blue
      foreground: "#E8E8FF", // Light blue-white
      cursor: "#FF00FF", // Neon magenta
      selection: "#303060", // Medium blue

      black: "#131521",
      red: "#FF4B58", // Neon red
      green: "#00FF9C", // Neon green
      yellow: "#FFF026", // Bright yellow
      blue: "#0077FF", // Bright blue
      magenta: "#FF00FF", // Neon magenta
      cyan: "#00FFFF", // Neon cyan
      white: "#E8E8FF", // Light blue-white

      brightBlack: "#565656",
      brightRed: "#FF6E67",
      brightGreen: "#5FFFB2",
      brightYellow: "#FFFC67",
      brightBlue: "#44A4FF",
      brightMagenta: "#FF67FF",
      brightCyan: "#67FFFF",
      brightWhite: "#FFFFFF",
    };

    // Extract neon night palette
    const neonNightPalette: ColorPalette = {
      primary: "#00FFFF", // Cyan
      secondary: "#0077FF", // Blue
      accent: "#FF00FF", // Magenta
      success: "#00FF9C", // Green
      warning: "#FFF026", // Yellow
      error: "#FF4B58", // Red
      output: "#E8E8FF", // White
      system: "#67FFFF", // Bright cyan
    };

    this.registerTheme("neon_night", neonNightTheme, neonNightPalette);

    // Bladerunner theme
    const bladerunnerTheme: TerminalTheme = {
      background: "#121212", // Almost black
      foreground: "#E8DCB1", // Warm white
      cursor: "#FF9900", // Orange amber
      selection: "#482826", // Dark copper

      black: "#1A1A1A",
      red: "#EE4B2B", // Dark orange-red
      green: "#C5E478", // Yellow-green
      yellow: "#FFB627", // Amber
      blue: "#46AFC9", // Teal
      magenta: "#CB1DCD", // Violet
      cyan: "#94D2E9", // Light blue
      white: "#E8DCB1", // Warm white

      brightBlack: "#565656",
      brightRed: "#FF674D",
      brightGreen: "#D6E98B",
      brightYellow: "#FFC34D",
      brightBlue: "#67C5DF",
      brightMagenta: "#E26AE1",
      brightCyan: "#B5E9FF",
      brightWhite: "#FFF8E6",
    };

    // Extract bladerunner palette
    const bladerunnerPalette: ColorPalette = {
      primary: "#FFB627", // Amber
      secondary: "#46AFC9", // Teal
      accent: "#CB1DCD", // Violet
      success: "#C5E478", // Yellow-green
      warning: "#FFB627", // Amber
      error: "#EE4B2B", // Dark orange-red
      output: "#E8DCB1", // Warm white
      system: "#94D2E9", // Light blue
    };

    this.registerTheme("bladerunner", bladerunnerTheme, bladerunnerPalette);

    // Ghost in the Shell theme
    const ghostTheme: TerminalTheme = {
      background: "#0F1126", // Dark navy blue
      foreground: "#DCD7BA", // Paper white
      cursor: "#73DACA", // Sea green
      selection: "#292E42", // Dark blue-grey

      black: "#15161E",
      red: "#F28779", // Soft red
      green: "#98BB6C", // Soft green
      yellow: "#E5C283", // Paper yellow
      blue: "#7FB4CA", // Soft blue
      magenta: "#957FB8", // Soft purple
      cyan: "#7AA89F", // Jade
      white: "#DCD7BA", // Paper white

      brightBlack: "#32334D",
      brightRed: "#FF9E8A",
      brightGreen: "#B9DA8F",
      brightYellow: "#F2D9A8",
      brightBlue: "#A6D4E2",
      brightMagenta: "#B89FDB",
      brightCyan: "#A6D6C9",
      brightWhite: "#F4EBD1",
    };

    // Extract ghost palette
    const ghostPalette: ColorPalette = {
      primary: "#7AA89F", // Jade
      secondary: "#7FB4CA", // Soft blue
      accent: "#957FB8", // Soft purple
      success: "#98BB6C", // Soft green
      warning: "#E5C283", // Paper yellow
      error: "#F28779", // Soft red
      output: "#DCD7BA", // Paper white
      system: "#A6D6C9", // Bright jade
    };

    this.registerTheme("ghost", ghostTheme, ghostPalette);

    // Synthwave theme
    const synthwaveTheme: TerminalTheme = {
      background: "#241B35", // Dark purple
      foreground: "#F4F4F7", // Off white
      cursor: "#F630EC", // Hot pink
      selection: "#493D63", // Medium purple

      black: "#29203A",
      red: "#FE4450", // Hot red
      green: "#72F1B8", // Neon aqua
      yellow: "#FFE261", // Neon yellow
      blue: "#0081FF", // Bright blue
      magenta: "#F630EC", // Hot pink
      cyan: "#03EDF9", // Bright cyan
      white: "#F4F4F7", // Off white

      brightBlack: "#4F4B63",
      brightRed: "#FF7A85",
      brightGreen: "#A2FFD8",
      brightYellow: "#FFEE8E",
      brightBlue: "#3EA8FF",
      brightMagenta: "#FF77F8",
      brightCyan: "#5EF9FF",
      brightWhite: "#FFFFFF",
    };

    // Extract synthwave palette
    const synthwavePalette: ColorPalette = {
      primary: "#03EDF9", // Bright cyan
      secondary: "#0081FF", // Bright blue
      accent: "#F630EC", // Hot pink
      success: "#72F1B8", // Neon aqua
      warning: "#FFE261", // Neon yellow
      error: "#FE4450", // Hot red
      output: "#F4F4F7", // Off white
      system: "#5EF9FF", // Bright cyan
    };

    this.registerTheme("synthwave", synthwaveTheme, synthwavePalette);
  }
}

// Default singleton instance
const themeManager = new ThemeManagerImpl();
export default themeManager;
