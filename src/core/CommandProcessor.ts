import { CommandResult } from "../../types";
import { CommandRegistry } from "./CommandRegistry";
import { VirtualFileSystem } from "../filesystem/VirtualFileSystem";
import { TerminalRendering } from "../terminal/interfaces/TerminalRendering";
import { EventEmitter } from "events";
import { commandListener } from "../commands";

export interface CommandExecutionContext {
  command: string;
  args: string[];
  timestamp: Date;
  executionTime: number;
  successful: boolean;
  errorMessage?: string;
  output?: string;
}

/**
 * Processes and executes commands using registered command handlers
 */
export class CommandProcessor extends EventEmitter {
  private commandRegistry: CommandRegistry;
  private fileSystem: VirtualFileSystem;
  private terminal: TerminalRendering | null = null;
  public responseCommand: any = null; // Property to store response command

  constructor(commandRegistry: CommandRegistry, fileSystem: VirtualFileSystem) {
    super();
    this.commandRegistry = commandRegistry;
    this.fileSystem = fileSystem;
  }

  /**
   * Set the terminal instance for rendering capabilities
   */
  public setTerminal(terminal: TerminalRendering): void {
    this.terminal = terminal;
  }

  /**
   * Process a command string and execute the command
   */
  public async process(input: string): Promise<CommandResult> {
    const startTime = performance.now();

    if (!input || input.trim() === "") {
      return {
        success: true,
        output: "",
      };
    }

    const trimmedInput = input.trim();

    // Check if input is just a number (for narrative choices)
    if (/^\d+$/.test(trimmedInput)) {
      const numericCommand = this.commandRegistry.getCommand("_numeric");
      if (numericCommand) {
        // Execute numeric choice command
        const result = await numericCommand.execute([], {
          currentDirectory: this.fileSystem.getCurrentPath(),
          filesystem: this.fileSystem,
          env: process.env as Record<string, string>,
          terminal: this.terminal,
          originalCommand: trimmedInput,
        });

        this.emitCommandExecution({
          command: "_numeric",
          args: [trimmedInput],
          timestamp: new Date(),
          executionTime: performance.now() - startTime,
          successful: result.success,
          errorMessage: result.error,
          output: result.output,
        });

        return result;
      }
    }

    // Parse the command line
    const args = this.parseCommandLine(input);
    const commandName = args.shift() || "";

    try {
      // Get the command handler
      let command = this.commandRegistry.getCommand(commandName);

      if (!command) {
        // First try to find fallback command handler (for command-based narrative choices)
        const fallbackCommand = this.commandRegistry.getCommand("_fallback");

        if (fallbackCommand) {
          // Execute fallback with full command as context
          const result = await fallbackCommand.execute(args, {
            currentDirectory: this.fileSystem.getCurrentPath(),
            filesystem: this.fileSystem,
            env: process.env as Record<string, string>,
            terminal: this.terminal,
            originalCommand: input.trim(), // Pass the full original command
          });

          // If the fallback successfully handled the command, return the result
          if (result.success || !result.error?.includes("Command not found")) {
            // Track command execution
            this.emitCommandExecution({
              command: commandName,
              args,
              timestamp: new Date(),
              executionTime: performance.now() - startTime,
              successful: result.success,
              errorMessage: result.error,
              output: result.output,
            });

            return result;
          }
        }

        // If we reach here, try the response command for direct narrative interaction
        // This allows users to type phrases or responses directly
        const responseCommand =
          this.responseCommand || this.commandRegistry.getCommand("_response");

        if (responseCommand) {
          console.log(
            `No command found for "${commandName}", using response command`
          );

          // Put the command name back with the args since it's all part of the response
          if (commandName) {
            args.unshift(commandName);
          }

          const result = await responseCommand.execute(args, {
            currentDirectory: this.fileSystem.getCurrentPath(),
            filesystem: this.fileSystem,
            env: process.env as Record<string, string>,
            terminal: this.terminal,
            originalCommand: input.trim(), // Pass the full original command
          });

          // Track command execution
          this.emitCommandExecution({
            command: "_response",
            args,
            timestamp: new Date(),
            executionTime: performance.now() - startTime,
            successful: result.success,
            errorMessage: result.error,
            output: result.output,
          });

          return result;
        }

        // If we still don't have a command handler, return an error
        return {
          success: false,
          error: `Command not found: ${commandName}`,
        };
      }

      // Execute the command
      const result = await command.execute(args, {
        currentDirectory: this.fileSystem.getCurrentPath(),
        filesystem: this.fileSystem,
        env: process.env as Record<string, string>,
        terminal: this.terminal,
      });

      // Track command execution
      this.emitCommandExecution({
        command: commandName,
        args,
        timestamp: new Date(),
        executionTime: performance.now() - startTime,
        successful: result.success,
        errorMessage: result.error,
        output: result.output,
      });

      return result;
    } catch (error) {
      // Handle errors during command execution
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Track the error
      this.emitCommandExecution({
        command: commandName,
        args,
        timestamp: new Date(),
        executionTime: performance.now() - startTime,
        successful: false,
        errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Parse a command line into command and arguments
   */
  private parseCommandLine(input: string): string[] {
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";
    let escapeNext = false;

    for (const char of input) {
      if (escapeNext) {
        current += char;
        escapeNext = false;
      } else if (char === "\\") {
        escapeNext = true;
      } else if (
        (char === '"' || char === "'") &&
        (!inQuotes || quoteChar === char)
      ) {
        inQuotes = !inQuotes;
        if (inQuotes) {
          quoteChar = char;
        } else {
          quoteChar = "";
        }
      } else if (char === " " && !inQuotes) {
        if (current) {
          parts.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Emit a command execution event
   * @param context The command execution context
   */
  private emitCommandExecution(context: CommandExecutionContext): void {
    // Preserve original event name for backward compatibility
    this.emit("command-executed", context);

    // Emit new event name for consistency
    this.emit("commandExecuted", context);

    // Forward command execution to command listener
    try {
      // Get command output if available
      const output = context.successful ? context.output : context.errorMessage;

      // Import the command listener if it exists
      const { commandListener } = require("../commands");
      if (
        commandListener &&
        typeof commandListener.commandExecuted === "function"
      ) {
        // Forward command execution with output
        commandListener.commandExecuted(
          context.command,
          context.args || [],
          context.successful,
          output
        );
      }
    } catch (error) {
      console.error(
        "[CommandProcessor] Error forwarding command execution:",
        error
      );
    }
  }
}
