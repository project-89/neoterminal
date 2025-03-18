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

// Utility commands
import { HelpCommand } from "./utility/HelpCommand";
import { ClearCommand } from "./utility/ClearCommand";
import { MissionsCommand } from "./utility/MissionsCommand";
import { AskCommand } from "./utility/AskCommand";
import { HintCommand } from "./utility/HintCommand";

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

  // Utility commands
  registry.registerCommand(new HelpCommand(registry));
  registry.registerCommand(new ClearCommand());
  registry.registerCommand(new MissionsCommand(missionManager));
  registry.registerCommand(new AskCommand(skillTracker));
  registry.registerCommand(new HintCommand(missionManager));

  // TODO: Add more commands as they are implemented
}
