import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";

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
    // This command doesn't actually do the clearing here
    // The TerminalEmulator will handle that when it sees this command result
    return {
      success: true,
      output: "\u001Bc", // ANSI escape sequence to clear screen
    };
  }
}
