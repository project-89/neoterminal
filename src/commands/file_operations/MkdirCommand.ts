import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

/**
 * Create directory command
 */
export class MkdirCommand implements Command {
  name = "mkdir";
  aliases = [];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Create a new directory";
  usage = "mkdir <directory>";
  examples = ["mkdir projects", "mkdir /home/user/docs/reports"];
  skillLevel = SkillLevel.INITIATE;

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    const { filesystem } = options;

    if (args.length === 0) {
      return {
        success: false,
        error: "Missing directory operand",
      };
    }

    const dirPath = args[0];

    try {
      filesystem.mkdir(dirPath);
      return {
        success: true,
        output: `Directory created: ${dirPath}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
