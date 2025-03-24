import { CommandRegistry } from "../core/CommandRegistry";
import { NarrativeManager } from "../narrative/NarrativeManager";
import { EventEmitter } from "events";

// Navigation commands
import { CdCommand } from "./navigation/CdCommand";
import { LsCommand } from "./navigation/LsCommand";
import { PwdCommand } from "./navigation/PwdCommand";

// File operation commands
import { CatCommand } from "./file_operations/CatCommand";
import { MkdirCommand } from "./file_operations/MkdirCommand";
import { TouchCommand } from "./file_operations/TouchCommand";
import { RmCommand } from "./file_operations/RmCommand";
import { CpCommand } from "./file_operations/CpCommand";
import { MvCommand } from "./file_operations/MvCommand";
import { ChmodCommand } from "./file_operations/ChmodCommand";
import { ChownCommand } from "./file_operations/ChownCommand";

// Text processing commands
import { GrepCommand } from "./text_processing/GrepCommand";
import { FindCommand } from "./text_processing/FindCommand";
import { SortCommand } from "./text_processing/SortCommand";
import { HeadCommand } from "./text_processing/HeadCommand";
import { TailCommand } from "./text_processing/TailCommand";
import { WcCommand } from "./text_processing/WcCommand";
import { UniqCommand } from "./text_processing/UniqCommand";
import { SedCommand } from "./text_processing/SedCommand";
import { AwkCommand } from "./text_processing/AwkCommand";

// System info commands
import { PsCommand } from "./system_info/PsCommand";
import { DfCommand } from "./system_info/DfCommand";
import { DuCommand } from "./system_info/DuCommand";
import { FreeCommand } from "./system_info/FreeCommand";

// Network commands
import { IfconfigCommand } from "./network/IfconfigCommand";
import { PingCommand } from "./network/PingCommand";
import { NetstatCommand } from "./network/NetstatCommand";

// Utility commands
import { HelpCommand } from "./utility/HelpCommand";
import { ClearCommand } from "./utility/ClearCommand";
import { AsciiCommand } from "./utility/AsciiCommand";
import { StartCommand } from "./utility/StartCommand";
import { CommandChoiceCommand } from "./utility/CommandChoiceCommand";
import { ResponseCommand } from "./utility/ResponseCommand";
import { AcknowledgeCommand } from "./utility/AcknowledgeCommand";

// System commands
import { ThemeCommand } from "./system/ThemeCommand";

/**
 * Command Listener Service - connects CLI command execution with the narrative system
 * This allows us to trigger narrative progression based on command execution
 */
export class CommandListenerService {
  private static instance: CommandListenerService;
  private emitter: EventEmitter;
  private narrativeManager: NarrativeManager | null = null;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance(): CommandListenerService {
    if (!CommandListenerService.instance) {
      CommandListenerService.instance = new CommandListenerService();
    }
    return CommandListenerService.instance;
  }

  public setNarrativeManager(narrativeManager: NarrativeManager): void {
    this.narrativeManager = narrativeManager;
  }

  /**
   * Event listener for when a command is executed
   * @param callback Function to be called when a command is executed
   */
  public onCommandExecuted(
    callback: (
      command: string,
      args: string[],
      success: boolean,
      output?: string
    ) => void
  ): void {
    this.emitter.on("commandExecuted", callback);
  }

  /**
   * Forward command execution event to the narrative system
   * @param command The command name
   * @param args The command arguments
   * @param success Whether the command executed successfully
   * @param output The command output (if available)
   */
  public commandExecuted(
    command: string,
    args: string[],
    success: boolean,
    output?: string
  ): void {
    console.log(
      `[CommandListener] Command executed: ${command} ${args.join(
        " "
      )} (success: ${success})`
    );
    this.emitter.emit("commandExecuted", command, args, success, output);

    // Forward to narrative manager if available
    if (this.narrativeManager) {
      this.narrativeManager.recordCommandExecution(
        command,
        args,
        success,
        output
      );

      // For key commands like pwd, ls, cd - we'll let the recordCommandExecution method handle this now
      // as we've updated it to process these command types directly
    }
  }
}

// Export the command listener instance
export const commandListener = CommandListenerService.getInstance();

/**
 * Register all available commands in the command registry
 * These are the actual system commands that the user will learn
 * @param registry The command registry to register commands in
 * @param narrativeManager Optional narrative manager for narrative-related commands
 */
export function registerCommands(
  registry: CommandRegistry,
  narrativeManager?: NarrativeManager
): void {
  // If narrative manager is provided, set it in the command listener
  if (narrativeManager) {
    commandListener.setNarrativeManager(narrativeManager);
  }

  // Navigation commands
  registry.registerCommand(new CdCommand());
  registry.registerCommand(new LsCommand());
  registry.registerCommand(new PwdCommand());

  // File operation commands
  registry.registerCommand(new CatCommand());
  registry.registerCommand(new MkdirCommand());
  registry.registerCommand(new TouchCommand());
  registry.registerCommand(new RmCommand());
  registry.registerCommand(new CpCommand());
  registry.registerCommand(new MvCommand());
  registry.registerCommand(new ChmodCommand());
  registry.registerCommand(new ChownCommand());

  // Text processing commands
  registry.registerCommand(new GrepCommand());
  registry.registerCommand(new FindCommand());
  registry.registerCommand(new SortCommand());
  registry.registerCommand(new HeadCommand());
  registry.registerCommand(new TailCommand());
  registry.registerCommand(new WcCommand());
  registry.registerCommand(new UniqCommand());
  registry.registerCommand(new SedCommand());
  registry.registerCommand(new AwkCommand());

  // System info commands
  registry.registerCommand(new PsCommand());
  registry.registerCommand(new DfCommand());
  registry.registerCommand(new DuCommand());
  registry.registerCommand(new FreeCommand());

  // Network commands
  registry.registerCommand(new IfconfigCommand());
  registry.registerCommand(new PingCommand());
  registry.registerCommand(new NetstatCommand());

  // Utility commands
  registry.registerCommand(new HelpCommand(registry));
  registry.registerCommand(new ClearCommand());
  registry.registerCommand(new AsciiCommand());
  registry.registerCommand(new StartCommand());

  // System commands
  registry.registerCommand(new ThemeCommand());

  // Register narrative command handler if narrative manager is provided
  if (narrativeManager) {
    registry.registerCommand(new CommandChoiceCommand(narrativeManager));
    registry.registerCommand(new ResponseCommand(narrativeManager));
  }
}
