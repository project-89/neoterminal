import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import chalk from "chalk";
import themeManager from "../../terminal/themes/ThemeManager";

/**
 * Clear terminal screen command
 */
export class ClearCommand implements Command {
  name = "clear";
  aliases = ["cls"];
  category = CommandCategory.UTILITY;
  description = "Clear the terminal screen";
  usage = "clear";
  examples = ["clear"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // Get the color palette from the theme manager
    const palette = themeManager.getColorPalette();

    // Create a welcome message with theme colors after clearing
    const welcomeMessage = [
      chalk.hex(palette.primary)("Screen cleared. NEOTERMINAL ready."),
      chalk.hex(palette.secondary)("Type 'help' for available commands."),
    ].join("\n");

    return {
      success: true,
      // ANSI escape sequence to clear screen plus themed welcome message
      output: `\u001Bc${welcomeMessage}`,
    };
  }
}
