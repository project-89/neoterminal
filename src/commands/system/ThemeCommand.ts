import { Command, CommandCategory, SkillLevel } from "../../../types";
import { CommandOptions, CommandResult } from "../../../types";
import { CommandUtils } from "../../utils/CommandUtils";
import themeManager from "../../terminal/themes/ThemeManager";
import { ColorPalette } from "../../terminal/themes/types";

/**
 * Command to manage terminal themes
 */
export class ThemeCommand implements Command {
  public readonly name = "theme";
  public readonly aliases = ["color", "colors"];
  public readonly category: CommandCategory = CommandCategory.UTILITY;
  public readonly description = "Manage terminal themes";
  public readonly usage = "theme [list|set|info] [theme-name]";
  public readonly examples = [
    "theme list         - List all available themes",
    "theme set cyberpunk - Set the active theme to cyberpunk",
    "theme info         - Show info about the current theme",
    "theme info neon_night - Show info about the neon_night theme",
  ];

  public readonly skillLevel: SkillLevel = SkillLevel.INITIATE;

  /**
   * Colorize text using ANSI color codes
   */
  private colorize(text: string, color: string): string {
    // Convert hex color to ANSI color sequence
    // This is a simplified approach - for full accuracy, a color conversion library would be better
    return `\x1b[38;2;${this.hexToRgb(color)}m${text}\x1b[0m`;
  }

  /**
   * Convert hex color to RGB format for ANSI color codes
   */
  private hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r};${g};${b}`;
  }

  private displayThemeColors(palette: ColorPalette, indent = ""): string[] {
    const colorLines = [
      `${indent}${this.colorize("■", palette.primary)} Primary: ${
        palette.primary
      }`,
      `${indent}${this.colorize("■", palette.secondary)} Secondary: ${
        palette.secondary
      }`,
      `${indent}${this.colorize("■", palette.accent)} Accent: ${
        palette.accent
      }`,
      `${indent}${this.colorize("■", palette.success)} Success: ${
        palette.success
      }`,
      `${indent}${this.colorize("■", palette.warning)} Warning: ${
        palette.warning
      }`,
      `${indent}${this.colorize("■", palette.error)} Error: ${palette.error}`,
      `${indent}${this.colorize("■", palette.output)} Output: ${
        palette.output
      }`,
      `${indent}${this.colorize("■", palette.system)} System: ${
        palette.system
      }`,
    ];

    return colorLines;
  }

  private generateColorPreview(palette: ColorPalette): string[] {
    // Generate a color preview box
    const lines: string[] = [];
    const boxWidth = 32; // Total width of the box

    // Header
    lines.push("╔════════════════════════════════╗");
    lines.push("║          COLOR PREVIEW         ║");
    lines.push("╟────────────────────────────────╢");

    // Helper function to calculate visible width excluding ANSI codes
    const calcVisibleWidth = (str: string): number => {
      // ANSI color code pattern: ESC[38;2;R;G;Bm...ESC[0m
      return str.replace(/\x1b\[[\d;]+m/g, "").length;
    };

    // Helper function to pad a colored string with spaces to align right border
    const padColoredString = (str: string): string => {
      const visibleWidth = calcVisibleWidth(str);
      const padding = boxWidth - visibleWidth - 3; // -3 for "║ " at start and "║" at end
      return `║ ${str}${" ".repeat(Math.max(0, padding))}║`;
    };

    // Primary section
    const primary = this.colorize("PRIMARY", palette.primary);
    lines.push(padColoredString(primary));

    const cmdOutput = this.colorize("Command output", palette.primary);
    lines.push(padColoredString(cmdOutput));

    // Secondary section
    const secondary = this.colorize("SECONDARY", palette.secondary);
    lines.push(padColoredString(secondary));

    const dirList = this.colorize("Directory listings", palette.secondary);
    lines.push(padColoredString(dirList));

    // Accent section
    const accent = this.colorize("ACCENT", palette.accent);
    lines.push(padColoredString(accent));

    const specialElems = this.colorize("Special elements", palette.accent);
    lines.push(padColoredString(specialElems));

    // Status colors
    const statusLine = `${this.colorize(
      "SUCCESS",
      palette.success
    )} ${this.colorize("WARNING", palette.warning)} ${this.colorize(
      "ERROR",
      palette.error
    )}`;
    lines.push(padColoredString(statusLine));

    // Footer
    lines.push("╚════════════════════════════════╝");

    return lines;
  }

  private getThemeInfo(themeName: string): string[] {
    const theme = themeManager.getTheme(themeName);
    const palette =
      themeName === themeManager.getActiveThemeId()
        ? themeManager.getColorPalette()
        : {
            primary: theme.cyan,
            secondary: theme.blue,
            accent: theme.magenta,
            success: theme.green,
            warning: theme.yellow,
            error: theme.red,
            output: theme.white,
            system: theme.brightCyan,
          };

    const output: string[] = [];
    output.push(
      `Theme: ${themeName}${
        themeName === themeManager.getActiveThemeId() ? " (Active)" : ""
      }`
    );
    output.push("─".repeat(40));
    output.push("Basic Colors:");
    output.push(`  Background: ${theme.background}`);
    output.push(`  Foreground: ${theme.foreground}`);
    output.push(`  Cursor: ${theme.cursor}`);
    output.push(`  Selection: ${theme.selection}`);
    output.push("");
    output.push("Color Palette:");
    output.push(...this.displayThemeColors(palette, "  "));
    output.push("");
    output.push(...this.generateColorPreview(palette));

    return output;
  }

  private getThemesList(): string[] {
    const themes = themeManager.getAvailableThemes();
    const activeTheme = themeManager.getActiveThemeId();

    const output: string[] = [];
    output.push("Available Themes:");
    output.push("─".repeat(40));

    themes.forEach((theme) => {
      const isActive = theme === activeTheme;
      output.push(
        `${isActive ? "► " : "  "}${theme}${isActive ? " (Active)" : ""}`
      );
    });

    output.push("");
    output.push("Use 'theme set <name>' to change the active theme");
    output.push("Use 'theme info <name>' to view theme details");

    return output;
  }

  public async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { terminal } = options;

    // Parse command arguments
    const action = args[0] || "list";
    const themeName = args[1] || themeManager.getActiveThemeId();

    try {
      switch (action.toLowerCase()) {
        case "list":
          return {
            success: true,
            output: this.getThemesList().join("\n"),
          };

        case "set":
          if (!args[1]) {
            return {
              success: false,
              error:
                "No theme name provided. Use 'theme list' to see available themes.",
              output:
                "Error: No theme name provided. Use 'theme list' to see available themes.",
            };
          }

          if (!themeManager.getAvailableThemes().includes(themeName)) {
            return {
              success: false,
              error: `Theme '${themeName}' not found. Use 'theme list' to see available themes.`,
              output: `Error: Theme '${themeName}' not found. Use 'theme list' to see available themes.`,
            };
          }

          themeManager.setTheme(themeName);
          if (terminal) {
            terminal.updateTheme(themeManager.getActiveTheme());
          }

          return {
            success: true,
            output: `Theme changed to '${themeName}'`,
          };

        case "info":
          return {
            success: true,
            output: this.getThemeInfo(themeName).join("\n"),
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${action}`,
            output: [
              `Unknown action: ${action}`,
              "Available actions: list, set, info",
              "Use 'help theme' for more information",
            ].join("\n"),
          };
      }
    } catch (error) {
      return CommandUtils.handleError(error);
    }
  }
}
