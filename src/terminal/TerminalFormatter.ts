import chalk from "chalk";
import { TerminalTheme } from "../../types";
import themeManager from "./themes/ThemeManager";

/**
 * TerminalFormatter provides styled text formatting for terminal output
 * It uses the terminal's active theme to apply consistent styling
 */
export class TerminalFormatter {
  /**
   * Format narrative text with dynamic styling
   * This makes narrative output more visually engaging with cyberpunk aesthetics
   *
   * @param text The narrative text to format
   * @param theme The terminal theme to use for styling
   * @returns Formatted text with color and style
   */
  public static formatNarrativeText(
    text: string,
    theme: TerminalTheme
  ): string {
    if (!text) return "";

    // Split text into sections to style differently
    const lines = text.split("\n");
    let result = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Style headers (all caps lines)
      if (line.match(/^[A-Z][A-Z\s\/]{3,}$/)) {
        result += chalk.hex(theme.brightCyan).bold(line) + "\n";
        continue;
      }

      // Style ASCII art blocks (multiple lines of special characters)
      if (line.match(/^[\/\\\|\-\+\=\_\*\#\@]{3,}$/)) {
        result += chalk.hex(theme.magenta)(line) + "\n";
        continue;
      }

      // Style character dialogue (format: [CHARACTER]: text)
      const dialogueMatch = line.match(/^\[([^\]]+)\]:\s*(.*)/);
      if (dialogueMatch) {
        const character = dialogueMatch[1];
        const dialogue = dialogueMatch[2];
        result +=
          chalk.hex(theme.brightYellow).bold(`[${character}]: `) +
          chalk.hex(theme.yellow)(dialogue) +
          "\n";
        continue;
      }

      // Style code blocks
      if (line.trim().startsWith("```")) {
        result += chalk.hex(theme.green)(line) + "\n";
        continue;
      }

      // Style inline code (backticks)
      if (line.includes("`")) {
        // Replace all instances of `code` with colored version
        const coloredLine = line.replace(
          /`([^`]+)`/g,
          (_, code) =>
            chalk.hex(theme.brightGreen)("`") +
            chalk.hex(theme.green)(code) +
            chalk.hex(theme.brightGreen)("`")
        );
        result += coloredLine + "\n";
        continue;
      }

      // Style commands and system terms
      const coloredLine = line
        // Highlight CLI commands - updated to only match whole words using word boundaries (\b)
        .replace(
          /\b(cd|ls|pwd|grep|cat|mkdir|rm|cp|mv|chmod|find|ssh)\b/g,
          (match) => chalk.hex(theme.cyan).bold(match)
        )
        // Highlight system paths
        .replace(/\/([\w\/\-\.]+)/g, (match) =>
          chalk.hex(theme.brightBlue)(match)
        )
        // Highlight terms in ALL CAPS
        .replace(/\b([A-Z]{2,})\b/g, (match) =>
          chalk.hex(theme.brightMagenta)(match)
        );

      // Default text styling
      result += chalk.hex(theme.foreground)(coloredLine) + "\n";
    }

    return result;
  }

  /**
   * Format command output with theme-based styling
   *
   * @param output The command output to format
   * @param theme The terminal theme to use for styling
   * @returns Formatted output with color and style
   */
  public static formatCommandOutput(
    output: string,
    theme: TerminalTheme
  ): string {
    if (!output) return "";

    // Basic styling for command output
    return chalk.hex(theme.white)(output);
  }

  /**
   * Create an ASCII box around text
   *
   * @param text The text to put in a box
   * @param theme The terminal theme to use for styling
   * @returns Text surrounded by an ASCII box
   */
  public static createAsciiBox(text: string, theme: TerminalTheme): string {
    const lines = text.split("\n");
    const width = Math.max(...lines.map((line) => line.length)) + 4;

    const top = "╔" + "═".repeat(width - 2) + "╗";
    const bottom = "╚" + "═".repeat(width - 2) + "╝";

    const boxedLines = lines.map((line) => {
      const padding = " ".repeat(width - line.length - 4);
      return "║ " + line + padding + " ║";
    });

    return chalk.hex(theme.cyan)(
      top + "\n" + boxedLines.join("\n") + "\n" + bottom
    );
  }

  /**
   * Highlight a specific word or phrase in text
   *
   * @param text The text containing the phrase to highlight
   * @param phrase The phrase to highlight
   * @param theme The terminal theme to use for styling
   * @returns Text with highlighted phrase
   */
  public static highlightPhrase(
    text: string,
    phrase: string,
    theme: TerminalTheme
  ): string {
    if (!text || !phrase) return text;

    const regex = new RegExp(phrase, "gi");
    return text.replace(regex, (match) => chalk.hex(theme.yellow).bold(match));
  }
}
