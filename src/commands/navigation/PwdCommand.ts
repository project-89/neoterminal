import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

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

    return {
      success: true,
      output: filesystem.getCurrentPath(),
    };
  }
}
