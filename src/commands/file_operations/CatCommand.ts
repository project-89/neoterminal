import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

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

    if (args.length === 0) {
      return {
        success: false,
        error: "Missing file operand",
      };
    }

    const filePath = args[0];

    try {
      const content = filesystem.readFile(filePath);
      return {
        success: true,
        output: content.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
