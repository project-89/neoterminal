import { CommandResult } from "../../types";
import chalk from "chalk";
import themeManager from "../terminal/themes/ThemeManager";
import { ColorPalette } from "../terminal/themes/types";

/**
 * Utility class for common command operations
 */
export class CommandUtils {
  /**
   * Handle errors in command execution
   */
  public static handleError(error: unknown): CommandResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const palette = themeManager.getColorPalette();

    return {
      success: false,
      output: chalk.hex(palette.error)(`Error: ${errorMessage}`),
      error: errorMessage,
    };
  }

  /**
   * Format bytes to human-readable form
   */
  public static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Parse command flags and options
   */
  public static parseOptions(args: string[]): {
    flags: Set<string>;
    options: Map<string, string>;
    positionalArgs: string[];
  } {
    const flags = new Set<string>();
    const options = new Map<string, string>();
    const positionalArgs: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Check if argument is a flag or option
      if (arg.startsWith("-")) {
        // Double dash options (--option=value or --option value)
        if (arg.startsWith("--")) {
          const optionText = arg.slice(2);

          // Handle --option=value format
          if (optionText.includes("=")) {
            const [key, value] = optionText.split("=", 2);
            options.set(key, value);
          }
          // Handle --option value format
          else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
            options.set(optionText, args[i + 1]);
            i++; // Skip the next argument as it's the value
          }
          // Flag without value
          else {
            flags.add(optionText);
          }
        }
        // Single dash can have multiple flags or be an option
        else {
          const flagsText = arg.slice(1);

          // Check if it's a single flag with a value (-o value)
          if (
            flagsText.length === 1 &&
            i + 1 < args.length &&
            !args[i + 1].startsWith("-")
          ) {
            options.set(flagsText, args[i + 1]);
            i++; // Skip the next argument as it's the value
          }
          // Multiple flags (-abc) or a single flag without value
          else {
            for (const flag of flagsText) {
              flags.add(flag);
            }
          }
        }
      }
      // Regular argument
      else {
        positionalArgs.push(arg);
      }
    }

    return { flags, options, positionalArgs };
  }

  /**
   * Check if a path is absolute
   */
  public static isAbsolutePath(path: string): boolean {
    return path.startsWith("/");
  }

  /**
   * Format string with color ANSI escape codes
   */
  public static colorize(text: string, colorCode: number): string {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  /**
   * Theme-based color methods for consistent styling across commands
   */
  public static themeColorize(
    text: string,
    colorType: keyof ColorPalette
  ): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette[colorType])(text);
  }

  /**
   * Colorize primary text (headings, important items)
   */
  public static primary(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.primary)(text);
  }

  /**
   * Colorize secondary text (file names, parameters)
   */
  public static secondary(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.secondary)(text);
  }

  /**
   * Colorize accent text (highlights, special items)
   */
  public static accent(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.accent)(text);
  }

  /**
   * Colorize success messages
   */
  public static success(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.success)(text);
  }

  /**
   * Colorize warning messages
   */
  public static warning(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.warning)(text);
  }

  /**
   * Colorize error messages
   */
  public static error(text: string): string {
    const palette = themeManager.getColorPalette();
    return chalk.hex(palette.error)(text);
  }
}
