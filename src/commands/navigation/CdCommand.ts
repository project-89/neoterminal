import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { VirtualDirectory } from "../../filesystem/VirtualNodes";

/**
 * Change directory command
 */
export class CdCommand implements Command {
  name = "cd";
  aliases = ["chdir"];
  category = CommandCategory.NAVIGATION;
  description = "Change the current working directory";
  usage = "cd [directory]";
  examples = ["cd /home/user", "cd ..", "cd ~", "cd"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    // If no arguments, change to home directory
    if (args.length === 0 || args[0] === "~") {
      try {
        filesystem.changeDirectory("/home/user");
        return {
          success: true,
          output: `Current directory: ${filesystem.getCurrentPath()}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    const targetPath = args[0];

    try {
      filesystem.changeDirectory(targetPath);
      return {
        success: true,
        output: `Current directory: ${filesystem.getCurrentPath()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
