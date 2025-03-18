import { CommandResult } from "../../types";
import { CommandRegistry } from "./CommandRegistry";
import { VirtualFileSystem } from "../filesystem/VirtualFileSystem";
import EventEmitter from "events";

export interface CommandExecutionContext {
  command: string;
  args: string[];
  timestamp: Date;
  executionTime: number;
  successful: boolean;
  errorMessage?: string;
}

/**
 * Processes and executes commands
 */
export class CommandProcessor extends EventEmitter {
  private commandRegistry: CommandRegistry;
  private fileSystem: VirtualFileSystem;

  constructor(commandRegistry: CommandRegistry, fileSystem: VirtualFileSystem) {
    super();
    this.commandRegistry = commandRegistry;
    this.fileSystem = fileSystem;
  }

  /**
   * Process a command string and execute the command
   */
  public async process(input: string): Promise<CommandResult> {
    const startTime = performance.now();

    try {
      // Parse command and arguments
      const [commandName, ...args] = this.parseCommandLine(input);

      // Find command in registry
      const command = this.commandRegistry.getCommand(commandName);

      if (!command) {
        const result = {
          success: false,
          error: `Command not found: ${commandName}`,
        };

        this.emitCommandExecution({
          command: commandName,
          args,
          timestamp: new Date(),
          executionTime: performance.now() - startTime,
          successful: false,
          errorMessage: result.error,
        });

        return result;
      }

      // Execute command
      const result = await command.execute(args, {
        currentDirectory: this.fileSystem.getCurrentPath(),
        filesystem: this.fileSystem,
        env: process.env as Record<string, string>,
      });

      // Track command execution
      this.emitCommandExecution({
        command: commandName,
        args,
        timestamp: new Date(),
        executionTime: performance.now() - startTime,
        successful: result.success,
        errorMessage: result.error,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.emitCommandExecution({
        command: input.split(" ")[0],
        args: [],
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
   * Emit command execution event
   */
  private emitCommandExecution(context: CommandExecutionContext): void {
    this.emit("command-executed", context);
  }
}
