import { CommandRegistry } from "./core/CommandRegistry";
import { CommandProcessor } from "./core/CommandProcessor";
import { VirtualFileSystem } from "./filesystem/VirtualFileSystem";
import { SkillTracker } from "./skills/SkillTracker";
import { TerminalEmulator } from "./terminal/TerminalEmulator";
import { registerCommands } from "./commands";
import { MissionManager } from "./missions/MissionManager";
import { initialMissions } from "./missions/initial-missions";
import { AIServiceManager } from "./ai";
import { loadConfig } from "./ai/config";
import { NarrativeManager } from "./narrative/NarrativeManager";

/**
 * NEOTERMINAL
 * Copyright (c) 2023
 */

console.log("NEOTERMINAL STARTING...");

(async () => {
  try {
    // Load configuration
    const config = await loadConfig();

    // Initialize AI service
    await AIServiceManager.initializeService(config);

    console.log("NEOTERMINAL INITIALIZED.");
  } catch (error) {
    console.error("ERROR INITIALIZING NEOTERMINAL:", error);
  }
})().catch((error) => {
  console.error("FATAL ERROR:", error);
  process.exit(1);
});
