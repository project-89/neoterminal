import { CommandRegistry } from "../core/CommandRegistry";
import { MissionManager } from "../missions/MissionManager";
import { SkillTracker } from "../skills/SkillTracker";

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
import { MissionsCommand } from "./utility/MissionsCommand";
import { AskCommand } from "./utility/AskCommand";
import { HintCommand } from "./utility/HintCommand";
import { AnimationCommand } from "./utility/AnimationCommand";
import { AsciiCommand } from "./utility/AsciiCommand";

// System commands
import { ThemeCommand } from "./system/ThemeCommand";

/**
 * Register all available commands in the command registry
 */
export function registerCommands(
  registry: CommandRegistry,
  missionManager: MissionManager,
  skillTracker: SkillTracker
): void {
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
  registry.registerCommand(new MissionsCommand(missionManager));
  registry.registerCommand(new AskCommand(skillTracker));
  registry.registerCommand(new HintCommand(missionManager));
  registry.registerCommand(new AnimationCommand());
  registry.registerCommand(new AsciiCommand());

  // System commands
  registry.registerCommand(new ThemeCommand());

  // TODO: Add more commands as they are implemented
}
