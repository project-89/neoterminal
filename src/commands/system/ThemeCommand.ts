import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import themeManager from "../../terminal/themes/ThemeManager";
import { TerminalFormatter } from "../../terminal/TerminalFormatter";

/**
 * Command for managing terminal theme settings
 */
export class ThemeCommand implements Command {
  public readonly name = "theme";
  public readonly aliases = ["color", "style"];
  public readonly description = "Change the terminal's visual theme";
  public readonly usage = "theme [name]";
  public readonly examples = [
    "theme - List available themes",
    "theme synthwave - Switch to the synthwave theme",
    "theme neon_night - Switch to the neon night theme",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  public async execute(args: string[], context: any): Promise<CommandResult> {
    // Get the terminal for applying themes
    const terminal = context.terminal;

    // If no arguments, list available themes
    if (!args.length) {
      const availableThemes = themeManager.getAvailableThemes();
      const currentTheme = themeManager.getActiveThemeId();

      const themeList = availableThemes
        .map((theme) =>
          theme === currentTheme ? `* ${theme} (current)` : `  ${theme}`
        )
        .join("\n");

      return {
        success: true,
        output: `Available themes:\n\n${themeList}\n\nUse 'theme [name]' to switch themes.`,
      };
    }

    // Otherwise, try to set the theme
    const themeName = args[0].toLowerCase();

    try {
      // Check if theme exists before trying to set it
      if (!themeManager.getAvailableThemes().includes(themeName)) {
        return {
          success: false,
          error: `Theme '${themeName}' not found. Use 'theme' to list available themes.`,
        };
      }

      // Set the theme (this method doesn't return anything)
      themeManager.setTheme(themeName);

      // Get the theme for formatting
      const theme = themeManager.getActiveTheme();

      // Create a sample to showcase the new theme
      const sampleText = `
NEOTERMINAL: CYBERPUNK TERMINAL

[ECHO]: Welcome to the ${themeName} theme.

Try these commands to see it in action:
\`ls\`
\`cd /documents\`
\`cat cyberpunk_manifesto.txt\`

You can find files in the SYSTEM directory and
navigate through the DIGITAL LANDSCAPE.
`;

      // Format the sample if we have access to terminal
      let output = `Theme set to ${themeName}.`;

      if (theme) {
        const formattedSample = TerminalFormatter.formatNarrativeText(
          sampleText,
          theme
        );
        output = `Theme set to ${themeName}.\n\n${formattedSample}`;
      }

      return {
        success: true,
        output: output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to set theme",
      };
    }
  }
}
