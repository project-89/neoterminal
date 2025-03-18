import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { CommandUtils } from "../../utils/CommandUtils";
import themeManager from "../../terminal/themes/ThemeManager";
import chalk from "chalk";

/**
 * Display file contents command
 */
export class CatCommand implements Command {
  name = "cat";
  aliases = ["type"];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Display the contents of a file";
  usage = "cat <file>";
  examples = ["cat README.txt", "cat /home/user/docs/tutorial.md"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;
    const palette = themeManager.getColorPalette();

    if (args.length === 0) {
      return {
        success: false,
        error: "Missing file operand",
        output: CommandUtils.error("Missing file operand"),
      };
    }

    const filePath = args[0];

    try {
      const content = filesystem.readFile(filePath);

      // Format the output with a file header and the content
      const fileHeader = CommandUtils.primary(`File: ${filePath}`);
      const formattedContent = chalk.hex(palette.output)(content.toString());
      const output = `${fileHeader}\n${"─".repeat(40)}\n${formattedContent}`;

      return {
        success: true,
        output: output,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        output: CommandUtils.error(`Error: ${errorMessage}`),
      };
    }
  }
}
