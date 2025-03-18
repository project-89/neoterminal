import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { CommandRegistry } from "../../core/CommandRegistry";

/**
 * Help command to display command documentation
 */
export class HelpCommand implements Command {
  name = "help";
  aliases = ["?"];
  category = CommandCategory.UTILITY;
  description = "Display help information about available commands";
  usage = "help [command]";
  examples = ["help", "help ls", "help cd"];
  skillLevel = SkillLevel.INITIATE;
  private commandRegistry: CommandRegistry;

  constructor(commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // If a command name is provided, show help for that command
    if (args.length > 0) {
      const commandName = args[0];
      const command = this.commandRegistry.getCommand(commandName);

      if (!command) {
        return {
          success: false,
          error: `No help available for unknown command: ${commandName}`,
        };
      }

      // Format detailed help for the command
      const helpText = [
        `COMMAND: ${command.name}`,
        `DESCRIPTION: ${command.description}`,
        `USAGE: ${command.usage}`,
        ...(command.aliases && command.aliases.length > 0
          ? [`ALIASES: ${command.aliases.join(", ")}`]
          : []),
        "EXAMPLES:",
        ...command.examples.map((ex) => `  ${ex}`),
      ].join("\n");

      return {
        success: true,
        output: helpText,
      };
    }

    // No command specified, show a list of all available commands
    const allCommands = this.commandRegistry.getAllCommands();
    const categorizedCommands = new Map<CommandCategory, Command[]>();

    // Group commands by category
    Object.values(CommandCategory).forEach((category) => {
      categorizedCommands.set(category, []);
    });

    allCommands.forEach((cmd) => {
      const category = cmd.category;
      const commands = categorizedCommands.get(category) || [];
      commands.push(cmd);
      categorizedCommands.set(category, commands);
    });

    // Build output
    const helpText = ["NEOTERMINAL HELP", "================"];

    // Add category sections
    categorizedCommands.forEach((commands, category) => {
      if (commands.length === 0) return;

      helpText.push("");
      helpText.push(`${formatCategoryName(category)}:`);

      // Sort commands by name
      commands.sort((a, b) => a.name.localeCompare(b.name));

      // Add command list with descriptions
      commands.forEach((cmd) => {
        helpText.push(`  ${cmd.name.padEnd(10)} - ${cmd.description}`);
      });
    });

    helpText.push("");
    helpText.push(
      'Type "help <command>" for detailed information about a specific command.'
    );

    return {
      success: true,
      output: helpText.join("\n"),
    };
  }
}

/**
 * Format a category name for display
 */
function formatCategoryName(category: CommandCategory): string {
  const words = category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  return words.join(" ");
}
