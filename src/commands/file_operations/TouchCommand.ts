import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

/**
 * Create file command
 */
export class TouchCommand implements Command {
  name = "touch";
  aliases = [];
  category = CommandCategory.FILE_OPERATIONS;
  description = "Create an empty file or update file access time";
  usage = "touch <file>";
  examples = ["touch newfile.txt", "touch /home/user/docs/report.md"];
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
      // Check if file exists
      const node = filesystem.getNode(filePath);

      if (node) {
        // File exists, just update timestamp
        // Note: this already happens when we access the node
        return {
          success: true,
          output: `File access time updated: ${filePath}`,
        };
      } else {
        // Create new empty file
        filesystem.writeFile(filePath, "");
        return {
          success: true,
          output: `File created: ${filePath}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
