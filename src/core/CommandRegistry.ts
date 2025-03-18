import { Command } from "../../types";

/**
 * Registry for all available commands in the system
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();

  /**
   * Register a new command
   */
  public registerCommand(command: Command): void {
    this.commands.set(command.name, command);

    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }
  }

  /**
   * Get a command by name or alias
   */
  public getCommand(nameOrAlias: string): Command | undefined {
    // Try to find by name first
    const command = this.commands.get(nameOrAlias);
    if (command) {
      return command;
    }

    // Try to find by alias
    const commandName = this.aliases.get(nameOrAlias);
    if (commandName) {
      return this.commands.get(commandName);
    }

    return undefined;
  }

  /**
   * Check if a command exists
   */
  public hasCommand(nameOrAlias: string): boolean {
    return this.getCommand(nameOrAlias) !== undefined;
  }

  /**
   * Get all registered commands
   */
  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all commands of a specific category
   */
  public getCommandsByCategory(category: string): Command[] {
    return this.getAllCommands().filter((cmd) => cmd.category === category);
  }

  /**
   * Unregister a command
   */
  public unregisterCommand(name: string): boolean {
    const command = this.commands.get(name);

    if (!command) {
      return false;
    }

    // Remove command
    this.commands.delete(name);

    // Remove aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }

    return true;
  }
}
