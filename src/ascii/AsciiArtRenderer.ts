import * as cyberpunkArt from "./art/cyberpunk";
import * as missionArt from "./art/missions";
import chalk from "chalk";
import themeManager from "../terminal/themes/ThemeManager";
import { ColorPalette } from "../terminal/themes/types";

/**
 * Represents a rendered ASCII art with styling information
 */
export interface RenderedAsciiArt {
  /**
   * The raw ASCII art string
   */
  raw: string;

  /**
   * The styled ASCII art string with color applied
   */
  styled: string;

  /**
   * The width of the ASCII art (maximum line length)
   */
  width: number;

  /**
   * The height of the ASCII art (number of lines)
   */
  height: number;
}

/**
 * Options for rendering ASCII art
 */
export interface AsciiArtOptions {
  /**
   * The color to use for the ASCII art
   * Can be a hex color string or a key from the ColorPalette
   */
  color?: string | keyof ColorPalette;

  /**
   * Whether to center the ASCII art horizontally
   */
  center?: boolean;

  /**
   * Width to center within (if centering)
   */
  centerWidth?: number;

  /**
   * Whether to add a border around the ASCII art
   */
  border?: boolean;

  /**
   * Whether to apply random glitch effects to some characters
   */
  glitch?: boolean;

  /**
   * Intensity of the glitch effect (0-1)
   */
  glitchIntensity?: number;

  /**
   * Whether to fade out the bottom of the ASCII art
   */
  fadeOut?: boolean;

  /**
   * Whether to include a rainbow gradient effect
   */
  rainbow?: boolean;
}

/**
 * Class for rendering ASCII art with various effects
 */
export class AsciiArtRenderer {
  /**
   * All available cyberpunk ASCII art
   */
  private cyberpunkArt: Map<string, string> = new Map();

  /**
   * All available mission ASCII art
   */
  private missionArt: Map<string, string> = new Map();

  /**
   * Additional custom ASCII art
   */
  private customArt: Map<string, string> = new Map();

  /**
   * Rainbow colors for gradient effects
   */
  private rainbowColors: string[] = [
    "#ff0000", // Red
    "#ff7f00", // Orange
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#0000ff", // Blue
    "#4b0082", // Indigo
    "#9400d3", // Violet
  ];

  /**
   * Create a new ASCII art renderer
   */
  constructor() {
    this.loadBuiltInArt();
  }

  /**
   * Load all built-in ASCII art into maps for easy access
   */
  private loadBuiltInArt(): void {
    // Load cyberpunk art
    Object.entries(cyberpunkArt).forEach(([key, value]) => {
      this.cyberpunkArt.set(key.toLowerCase(), value);
    });

    // Load mission art
    Object.entries(missionArt).forEach(([key, value]) => {
      this.missionArt.set(key.toLowerCase(), value);
    });
  }

  /**
   * Add custom ASCII art
   * @param name Name for the art
   * @param art ASCII art string
   */
  public addCustomArt(name: string, art: string): void {
    this.customArt.set(name.toLowerCase(), art);
  }

  /**
   * Get a list of all available ASCII art names
   * @param category Optional category to filter by: 'cyberpunk', 'mission', or 'custom'
   */
  public getAvailableArt(
    category?: "cyberpunk" | "mission" | "custom"
  ): string[] {
    if (category === "cyberpunk") {
      return Array.from(this.cyberpunkArt.keys());
    } else if (category === "mission") {
      return Array.from(this.missionArt.keys());
    } else if (category === "custom") {
      return Array.from(this.customArt.keys());
    } else {
      return [
        ...Array.from(this.cyberpunkArt.keys()),
        ...Array.from(this.missionArt.keys()),
        ...Array.from(this.customArt.keys()),
      ];
    }
  }

  /**
   * Apply a color to ASCII art
   * @param art ASCII art string
   * @param color Color to apply (hex or ColorPalette key)
   */
  private applyColor(art: string, color: string | keyof ColorPalette): string {
    let colorHex: string;

    // If color is a ColorPalette key, get the hex value
    if (typeof color === "string" && !color.startsWith("#")) {
      const palette = themeManager.getColorPalette();
      if (color in palette) {
        colorHex = palette[color as keyof ColorPalette];
      } else {
        // Default to output color
        colorHex = palette.output;
      }
    } else {
      // Color is already a hex value
      colorHex = color as string;
    }

    return chalk.hex(colorHex)(art);
  }

  /**
   * Apply rainbow gradient effect to ASCII art
   * @param art ASCII art string
   */
  private applyRainbow(art: string): string {
    const lines = art.split("\n");
    return lines
      .map((line, lineIndex) => {
        const colorIndex = lineIndex % this.rainbowColors.length;
        return chalk.hex(this.rainbowColors[colorIndex])(line);
      })
      .join("\n");
  }

  /**
   * Apply a glitch effect to ASCII art
   * @param art ASCII art string
   * @param intensity Intensity of the glitch (0-1)
   */
  private applyGlitch(art: string, intensity: number = 0.3): string {
    const glitchChars = "!<>-_\\/[]{}—=+*^?#$%&@";
    const lines = art.split("\n");

    return lines
      .map((line) => {
        let result = "";
        for (let i = 0; i < line.length; i++) {
          // Only glitch non-space characters
          if (line[i] !== " " && Math.random() < intensity) {
            // Replace with random glitch character
            const glitchChar =
              glitchChars[Math.floor(Math.random() * glitchChars.length)];
            result += glitchChar;
          } else {
            result += line[i];
          }
        }
        return result;
      })
      .join("\n");
  }

  /**
   * Apply a fade out effect to the bottom of ASCII art
   * @param art ASCII art string
   */
  private applyFadeOut(art: string): string {
    const lines = art.split("\n");
    const startFade = Math.floor(lines.length * 0.7);

    return lines
      .map((line, index) => {
        if (index < startFade) {
          return line;
        }

        // Calculate opacity based on position
        const fadeProgress = (index - startFade) / (lines.length - startFade);
        const opacity = 1 - fadeProgress;

        // Use chalk's dim and RGB features to simulate fade
        return chalk.rgb(
          Math.floor(255 * opacity),
          Math.floor(255 * opacity),
          Math.floor(255 * opacity)
        )(line);
      })
      .join("\n");
  }

  /**
   * Center ASCII art horizontally within a given width
   * @param art ASCII art string
   * @param width Width to center within
   */
  private centerArt(art: string, width: number): string {
    const lines = art.split("\n");
    const maxLineLength = Math.max(...lines.map((line) => line.length));

    return lines
      .map((line) => {
        // Calculate padding
        const padding = Math.max(0, Math.floor((width - line.length) / 2));
        return " ".repeat(padding) + line;
      })
      .join("\n");
  }

  /**
   * Add a border around ASCII art
   * @param art ASCII art string
   */
  private addBorder(art: string): string {
    const lines = art.split("\n");
    const maxLineLength = Math.max(...lines.map((line) => line.length));

    const topBorder = `┌${"─".repeat(maxLineLength + 2)}┐`;
    const bottomBorder = `└${"─".repeat(maxLineLength + 2)}┘`;

    const borderedLines = lines.map((line) => {
      // Add side borders and pad to max length
      return `│ ${line}${" ".repeat(maxLineLength - line.length)} │`;
    });

    return [topBorder, ...borderedLines, bottomBorder].join("\n");
  }

  /**
   * Get the raw ASCII art by name
   * @param name Name of the ASCII art to get
   */
  public getArt(name: string): string | null {
    const lowerName = name.toLowerCase();

    if (this.cyberpunkArt.has(lowerName)) {
      return this.cyberpunkArt.get(lowerName) as string;
    }

    if (this.missionArt.has(lowerName)) {
      return this.missionArt.get(lowerName) as string;
    }

    if (this.customArt.has(lowerName)) {
      return this.customArt.get(lowerName) as string;
    }

    return null;
  }

  /**
   * Render ASCII art with specified options
   * @param name Name of the ASCII art to render, or raw ASCII art string
   * @param options Options for rendering
   */
  public render(
    name: string,
    options: AsciiArtOptions = {}
  ): RenderedAsciiArt | null {
    // Get the raw art
    let rawArt = this.getArt(name);

    // If not found, check if it might be raw ASCII art
    if (!rawArt && name.includes("\n")) {
      rawArt = name;
    }

    if (!rawArt) {
      return null;
    }

    let processedArt = rawArt;
    const lines = processedArt.split("\n");
    const width = Math.max(...lines.map((line) => line.length));
    const height = lines.length;

    // Apply transformations based on options
    if (options.glitch && options.glitchIntensity) {
      processedArt = this.applyGlitch(processedArt, options.glitchIntensity);
    } else if (options.glitch) {
      processedArt = this.applyGlitch(processedArt);
    }

    if (options.border) {
      processedArt = this.addBorder(processedArt);
    }

    if (options.center && options.centerWidth) {
      processedArt = this.centerArt(processedArt, options.centerWidth);
    }

    if (options.fadeOut) {
      processedArt = this.applyFadeOut(processedArt);
    }

    // Apply color after all transformations
    let styledArt: string;
    if (options.rainbow) {
      styledArt = this.applyRainbow(processedArt);
    } else if (options.color) {
      styledArt = this.applyColor(processedArt, options.color);
    } else {
      // Default to primary color from theme
      styledArt = this.applyColor(processedArt, "primary");
    }

    return {
      raw: rawArt,
      styled: styledArt,
      width,
      height,
    };
  }
}
