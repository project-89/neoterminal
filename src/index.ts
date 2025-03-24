// Load environment variables from .env file
import "dotenv/config";

import { CommandRegistry } from "./core/CommandRegistry";
import { CommandProcessor } from "./core/CommandProcessor";
import { VirtualFileSystem } from "./filesystem/VirtualFileSystem";
import { TerminalEmulator } from "./terminal/TerminalEmulator";
import { registerCommands } from "./commands";
import { AIServiceManager } from "./ai";
import { loadConfig } from "./ai/config";
import { NarrativeManager } from "./narrative/NarrativeManager";
import { NarrativeCommand } from "./commands/utility/NarrativeCommand";
import { CommandChoiceCommand } from "./commands/utility/CommandChoiceCommand";
import { ResponseCommand } from "./commands/utility/ResponseCommand";
import { AcknowledgeCommand } from "./commands/utility/AcknowledgeCommand";

/**
 * NEOTERMINAL
 * An immersive CLI learning experience powered by AI
 * Copyright (c) 2023
 */

console.log("NEOTERMINAL STARTING...");

// Log the AI provider being used
console.log(`AI Provider: ${process.env.AI_PROVIDER || "local"}`);

(async () => {
  try {
    // Load configuration
    const config = await loadConfig();

    // Determine the appropriate API key based on the provider
    let apiKey = config.apiKey;
    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (config.provider === "claude" && process.env.CLAUDE_API_KEY) {
      apiKey = process.env.CLAUDE_API_KEY;
    } else if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
    }

    // Initialize AI service
    await AIServiceManager.initializeService({
      provider: config.provider,
      apiKey: apiKey,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      endpoint: config.endpoint,
    });

    // Initialize the core systems
    const filesystem = new VirtualFileSystem();
    const commandRegistry = new CommandRegistry();
    const commandProcessor = new CommandProcessor(commandRegistry, filesystem);

    // Initialize the AI-powered narrative system
    const narrativeManager = new NarrativeManager();

    // Register real system commands
    registerCommands(commandRegistry, narrativeManager);

    // Create the response command for direct access
    const responseCommand = new ResponseCommand(narrativeManager);

    // Register narrative interaction commands
    commandRegistry.registerCommand(new NarrativeCommand(narrativeManager));
    commandRegistry.registerCommand(new CommandChoiceCommand(narrativeManager));
    commandRegistry.registerCommand(responseCommand);
    commandRegistry.registerCommand(new AcknowledgeCommand(narrativeManager));

    // Directly attach the response command to the command processor
    // @ts-ignore - Add a property to store the response command
    commandProcessor.responseCommand = responseCommand;

    // Debug: Check if command is registered
    console.log(
      "Response command registered:",
      commandRegistry.hasCommand("_response")
    );
    console.log(
      "All registered commands:",
      commandRegistry
        .getAllCommands()
        .map((cmd) => cmd.name)
        .join(", ")
    );

    // Create and initialize terminal with the narrative manager
    const terminal = new TerminalEmulator(commandProcessor, narrativeManager);

    // Initialize the terminal and start the interface
    await terminal.initialize();

    // Start the narrative experience
    setTimeout(() => {
      terminal.write("\n");
      terminal.write("Welcome to NEOTERMINAL - A CLI Learning Adventure\n");
      terminal.write(
        "Type 'help' to see available commands or 'start' to begin your journey.\n"
      );
    }, 1000);

    console.log("NEOTERMINAL INITIALIZED.");
  } catch (error) {
    console.error("ERROR INITIALIZING NEOTERMINAL:", error);
  }
})().catch((error) => {
  console.error("FATAL ERROR:", error);
  process.exit(1);
});
