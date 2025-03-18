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
 * Print working directory command
 */
export class PwdCommand implements Command {
  name = "pwd";
  aliases = [];
  category = CommandCategory.NAVIGATION;
  description = "Print the current working directory";
  usage = "pwd";
  examples = ["pwd"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;
    const currentPath = filesystem.getCurrentPath();

    // Get the color palette from the theme manager
    const palette = themeManager.getColorPalette();

    // Apply primary color to the path output
    const colorizedOutput = chalk.hex(palette.primary)(currentPath);

    return {
      success: true,
      output: colorizedOutput,
    };
  }
}
