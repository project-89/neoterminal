import { AIServiceManager } from "../ai";
import EventEmitter from "events";

// Skill level for commands
enum CommandMastery {
  UNKNOWN = 0, // Never used
  NOVICE = 1, // Used 1-2 times
  BEGINNER = 2, // Used 3-5 times
  INTERMEDIATE = 3, // Used 6-10 times
  ADVANCED = 4, // Used 11-20 times
  EXPERT = 5, // Used 20+ times
}

// Command progression stages - sets of commands taught at each stage
const COMMAND_PROGRESSION = {
  NAVIGATION: ["ls", "cd", "pwd"],
  FILE_OPERATIONS: ["cat", "touch", "mkdir", "rm"],
  TEXT_PROCESSING: ["grep", "find", "head", "tail"],
  ADVANCED: ["chmod", "cp", "mv", "sed", "awk"],
  NETWORKING: ["ssh", "ping", "netstat", "curl"],
};

/**
 * LLM-powered narrative manager that handles the interactive story
 */
export class NarrativeManager extends EventEmitter {
  // Store conversation history
  private conversationHistory: Array<{ role: string; content: string }> = [];

  // Store game state
  private gameState: {
    currentChapter: number;
    flags: Set<string>;
    completedTutorials: Set<string>;
    commandHistory: string[];
    characterRelationships: Map<string, number>;
    lastCommand?: string; // Track the last command executed
    lastCommandOutput?: string; // Track output from the last command
    commandMastery: Map<string, CommandMastery>; // Track command mastery levels
    expectedCommand?: string; // The command we expect the user to try next
    currentStage: string; // Current progression stage (NAVIGATION, FILE_OPERATIONS, etc.)
  };

  // For compatibility with existing narrative commands
  private currentNode: any = null;
  private availableChoices: any[] = [];

  // System prompt for setting context
  private systemPrompt = `
You are the game master for NEOTERMINAL, an immersive CLI learning adventure.
Guide the player through a cyberpunk narrative that teaches command line skills.

Game context:
- The player is a hacker who discovers they have the ability to see "the code behind reality"
- The player can interact with a terminal that lets them manipulate the digital world
- Your job is to slowly introduce CLI commands (like cd, ls, grep, etc.) through the story
- Start with basic commands and gradually introduce more advanced ones
- Always provide clear instructions that teach players how to use commands
- Frame command usage as "hacking" into systems
- The narrative has a cyberpunk aesthetic with themes of surveillance, AI, and digital liberation

Important rules:
1. Keep responses conversational, engaging and in-universe
2. Don't break character or mention that you're an AI
3. When introducing a new command, explain what it does in the context of the story
4. Provide clear examples of commands within the narrative
5. Monitor which commands the player has used and adapt the difficulty accordingly
6. Praise correct command usage and gently correct mistakes
7. Allow for creative solutions using commands

Format your responses like a text adventure with:
1. Story/narrative developments
2. Character dialogue (if any)
3. Terminal outputs when commands are run (in code blocks)
4. Gentle guidance on what to do next
`;

  /**
   * Creates a new NarrativeManager
   */
  constructor() {
    super();

    // Initialize game state
    this.gameState = {
      currentChapter: 1,
      flags: new Set<string>(),
      completedTutorials: new Set<string>(),
      commandHistory: [],
      characterRelationships: new Map<string, number>(),
      commandMastery: new Map<string, CommandMastery>(),
      currentStage: "NAVIGATION", // Start with basic navigation commands
    };

    // Add system message to conversation history
    this.conversationHistory.push({
      role: "system",
      content: this.systemPrompt,
    });

    // Add initial greeting to conversation history
    this.conversationHistory.push({
      role: "assistant",
      content: "Welcome to NEOTERMINAL. Type 'start' to begin your adventure.",
    });

    console.log("[NarrativeManager] Initialized");
  }

  /**
   * Record a command execution in the game state
   * @param command - The command that was executed
   * @param args - The arguments passed to the command
   * @param success - Whether the command executed successfully
   * @param output - Optional output from the command execution
   */
  public recordCommandExecution(
    command: string,
    args: string[],
    success: boolean,
    output?: string
  ): void {
    const fullCommand = `${command} ${args.join(" ")}`.trim();

    // Add command to history
    this.gameState.commandHistory.push(fullCommand);

    // Track last command and output for context
    this.gameState.lastCommand = fullCommand;
    this.gameState.lastCommandOutput = output;

    // If command executed successfully, update mastery level
    if (success) {
      this.updateCommandMastery(command);
    }

    // Determine if this command is part of the expected progression
    const isProgressionCommand = this.isProgressionCommand(command);
    const matchesExpected = this.matchesExpectedCommand(command);

    // Only process key commands through the narrative system if they align with progression
    if (isProgressionCommand && success) {
      console.log(
        `[NarrativeManager] CLI command detected: ${fullCommand} (matches expected: ${matchesExpected})`
      );

      // Process command through narrative system
      this.processCliCommand(fullCommand, output, matchesExpected).catch(
        (err) => {
          console.error(
            "[NarrativeManager] Error processing CLI command:",
            err
          );
        }
      );
    }

    // Trigger event for command execution
    this.emit("commandExecuted", {
      command,
      args,
      success,
      output,
      isProgressionCommand,
      matchesExpected,
    });
  }

  /**
   * Process a CLI command through the narrative system
   * @param command - The command that was executed (including args)
   * @param output - The output from the command execution
   * @param matchesExpected - Whether this command matches what was expected
   * @returns Promise resolving to the narrative response
   */
  public async processCliCommand(
    command: string,
    output?: string,
    matchesExpected: boolean = false
  ): Promise<string> {
    // Get the last few exchanges for context (up to 4 exchanges)
    const recentHistory = this.getRecentExchanges(4);

    // Create a specialized message for CLI commands with added context
    const cliMessage = `
I just executed the command: \`${command}\`
${output ? `\nThe command output was:\n\`\`\`\n${output}\n\`\`\`` : ""}

${
  matchesExpected
    ? "This is the command I was expected to try next in the tutorial."
    : "This command was executed but wasn't specifically what the tutorial suggested trying next."
}

Recent narrative context:
${recentHistory}

Current command skill levels:
${this.getCommandMasteryDescription()}

Current progression stage: ${this.gameState.currentStage}
Expected next command: ${this.gameState.expectedCommand || "None specified yet"}
Command history: ${this.gameState.commandHistory.slice(-5).join(", ")}

${
  !matchesExpected && this.gameState.expectedCommand
    ? `The user was expected to try '${this.gameState.expectedCommand}' next, but tried '${command}' instead.`
    : ""
}

Please continue the tutorial narrative based on this command execution.
${
  matchesExpected
    ? "The user successfully followed your instructions, so explain what the command did and introduce the next concept or command to try."
    : "The user tried a different command than suggested. Acknowledge it, explain what it does clearly, but firmly redirect them to try the expected command next."
}

Make your tutorial guidance adaptive to their command mastery:
- For NOVICE level commands: Be very explicit and provide clear instructions
- For BEGINNER level commands: Give some hints but less direct instructions
- For INTERMEDIATE level commands: Set goals rather than specific commands
- For ADVANCED/EXPERT level commands: Just set objectives and let them figure out the approach

Be specific about what the user should try next, wrap the command in backticks like \`command\` so I can track it.
`;

    const response = await this.processUserMessage(cliMessage);

    // Extract any expected commands from the response
    this.extractExpectedCommand(response);

    // Emit an event with the narrative response, so the terminal can display it
    this.emit("narrativeResponse", response);

    return response;
  }

  /**
   * Get recent conversation exchanges for context
   * @param count - Number of exchanges to retrieve
   * @returns Formatted string of recent exchanges
   */
  private getRecentExchanges(count: number): string {
    // Get the most recent exchanges, skipping the system prompt
    const relevantHistory = this.conversationHistory.slice(1);
    const recentExchanges = relevantHistory.slice(-count * 2); // * 2 because each exchange has user + assistant message

    let formattedHistory = "";
    for (let i = 0; i < recentExchanges.length; i += 2) {
      // Get the user message
      if (i < recentExchanges.length) {
        const userMsg = recentExchanges[i];
        if (userMsg && userMsg.role === "user") {
          formattedHistory += `USER: ${userMsg.content.substring(0, 100)}${
            userMsg.content.length > 100 ? "..." : ""
          }\n`;
        }
      }

      // Get the assistant response
      if (i + 1 < recentExchanges.length) {
        const assistantMsg = recentExchanges[i + 1];
        if (assistantMsg && assistantMsg.role === "assistant") {
          formattedHistory += `ASSISTANT: ${assistantMsg.content.substring(
            0,
            100
          )}${assistantMsg.content.length > 100 ? "..." : ""}\n`;
        }
      }
    }

    return formattedHistory || "No recent exchanges found.";
  }

  /**
   * Extract expected command from the narrative response
   * This looks for patterns like "try the command `ls`" or "use `cd documents`"
   */
  public extractExpectedCommand(response: string): void {
    // Common patterns for command suggestions
    const patterns = [
      // Explicit patterns with command in backticks, quotes or code blocks
      /try (?:the )?(?:command )?[`'"]([\w\s\-\.\/]+)[`'"]/i,
      /use (?:the )?(?:command )?[`'"]([\w\s\-\.\/]+)[`'"]/i,
      /type [`'"]([\w\s\-\.\/]+)[`'"]/i,
      /run [`'"]([\w\s\-\.\/]+)[`'"]/i,
      /execute [`'"]([\w\s\-\.\/]+)[`'"]/i,
      /enter [`'"]([\w\s\-\.\/]+)[`'"]/i,

      // Code block patterns
      /```\s*([\w\s\-\.\/]+)\s*```/i,
      /`([\w\s\-\.\/]+)`/i,

      // Patterns for commands with arguments
      /cd\s+([^\s`'"]+)/i,
      /ls\s+([^\s`'"]+)/i,
      /cat\s+([^\s`'"]+)/i,
      /grep\s+([^\s`'"]+)/i,
      /find\s+([^\s`'"]+)/i,

      // Named commands within the text
      /\bcd\b/i,
      /\bls\b/i,
      /\bpwd\b/i,
      /\bcat\b/i,
      /\bgrep\b/i,
      /\bfind\b/i,
      /\bmkdir\b/i,
      /\btouch\b/i,
      /\brm\b/i,
    ];

    // Try each pattern to find a match
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        // If we have a capture group (most patterns), use that
        // Otherwise use the full match (simple command patterns like /\bcd\b/)
        const command = match[1] || match[0];

        // Only accept if it's a reasonable command length
        if (command && command.length >= 2 && command.length <= 50) {
          console.log(
            `[NarrativeManager] Setting expected command: ${command}`
          );
          this.setExpectedCommand(command);
          break;
        }
      }
    }
  }

  /**
   * Process a user message through the LLM and generate a response
   * @param message - The user's message
   * @returns The narrative response
   */
  public async processUserMessage(message: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: message,
      });

      // Get AI service from the AIServiceManager instance
      const aiService = AIServiceManager.getCurrentService();
      if (!aiService) {
        throw new Error("AI service not initialized");
      }

      // Generate response
      const response = await aiService.generateResponse(
        this.conversationHistory
      );

      // Add response to conversation history
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      });

      // Return the generated response
      return response;
    } catch (error) {
      console.error("[NarrativeManager] Error processing message:", error);
      return "I'm sorry, there was an error processing your request. Please check that your Gemini API key is configured correctly in the .env file.";
    }
  }

  /**
   * Add a flag to the game state
   * @param flag - The flag to add
   */
  public addFlag(flag: string): void {
    this.gameState.flags.add(flag);
    this.emit("flagAdded", { flag });
  }

  /**
   * Check if a flag is set in the game state
   * @param flag - The flag to check
   * @returns True if the flag is set
   */
  public hasFlag(flag: string): boolean {
    return this.gameState.flags.has(flag);
  }

  /**
   * Mark a tutorial as completed
   * @param tutorial - The tutorial identifier
   */
  public completeTask(tutorial: string): void {
    this.gameState.completedTutorials.add(tutorial);
    this.emit("taskCompleted", { tutorial });
  }

  /**
   * Get the current game state
   * @returns The current game state
   */
  public getGameState(): any {
    return { ...this.gameState };
  }

  /**
   * Get available choices for the current narrative state (compatibility method)
   * @returns List of available choices
   */
  public getAvailableChoices(): any[] {
    // Return an empty array or placeholder choices
    return this.availableChoices;
  }

  /**
   * Make a choice in the narrative (compatibility method)
   * @param choiceId ID of the choice to make
   * @returns True if successful
   */
  public makeChoice(choiceId: string): boolean {
    // Send the choice as a message
    this.processUserMessage(`I choose option ${choiceId}`).catch((error) => {
      console.error("Error making choice:", error);
    });

    return true;
  }

  /**
   * Get the current narrative node (compatibility method)
   * @returns Current node or null
   */
  public getCurrentNode(): any {
    return this.currentNode;
  }

  /**
   * Get the current speaker character (compatibility method)
   * @returns Current speaker or null
   */
  public getCurrentSpeaker(): any {
    return null;
  }

  /**
   * Get all available chapters (compatibility method)
   * @returns List of chapters
   */
  public getAllChapters(): any[] {
    return [
      {
        id: "chapter_001",
        title: "The Awakening",
        startingNodeId: "node_001_intro",
      },
      {
        id: "chapter_002",
        title: "Digital Footprints",
        startingNodeId: "node_002_intro",
      },
      {
        id: "chapter_003",
        title: "The Data Heist",
        startingNodeId: "node_003_intro",
      },
      {
        id: "chapter_004",
        title: "Digital Underground",
        startingNodeId: "node_004_intro",
      },
      {
        id: "chapter_005",
        title: "Corporate Infiltration",
        startingNodeId: "node_005_intro",
      },
    ];
  }

  /**
   * Get a specific chapter by ID (compatibility method)
   * @param chapterId ID of the chapter
   * @returns Chapter object or undefined
   */
  public getChapter(chapterId: string): any {
    const chapters = this.getAllChapters();
    return chapters.find((c) => c.id === chapterId);
  }

  /**
   * Start a specific chapter (compatibility method)
   * @param chapterId ID of the chapter to start
   * @returns True if successful
   */
  public startChapter(chapterId: string): boolean {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return false;

    // Set the current chapter
    this.gameState.currentChapter = parseInt(chapterId.split("_")[1], 10);

    // Send a message to start this chapter
    this.processUserMessage(`Start chapter ${chapterId}`).catch((error) => {
      console.error("Error starting chapter:", error);
    });

    return true;
  }

  /**
   * Check if a command is part of our progression system
   */
  private isProgressionCommand(command: string): boolean {
    // Get the base command (without arguments)
    const baseCommand = command.split(" ")[0];

    // Check if the command is in any of our progression stages
    return Object.values(COMMAND_PROGRESSION).some((commands) =>
      commands.includes(baseCommand)
    );
  }

  /**
   * Check if a command matches what we expect the user to try next
   */
  private matchesExpectedCommand(command: string): boolean {
    if (!this.gameState.expectedCommand) {
      return false;
    }

    // Get the base command (without arguments)
    const baseCommand = command.split(" ")[0];
    const expectedBase = this.gameState.expectedCommand.split(" ")[0];

    // For now, just match the base command (we could get more sophisticated later)
    return baseCommand === expectedBase;
  }

  /**
   * Update the mastery level for a command
   */
  private updateCommandMastery(command: string): void {
    // Get the base command (without arguments)
    const baseCommand = command.split(" ")[0];

    // Get current mastery level (default to UNKNOWN)
    const currentLevel =
      this.gameState.commandMastery.get(baseCommand) || CommandMastery.UNKNOWN;

    // Update based on current level
    let newLevel = currentLevel;
    switch (currentLevel) {
      case CommandMastery.UNKNOWN:
        newLevel = CommandMastery.NOVICE;
        break;
      case CommandMastery.NOVICE:
        if (this.getCommandUseCount(baseCommand) >= 3) {
          newLevel = CommandMastery.BEGINNER;
        }
        break;
      case CommandMastery.BEGINNER:
        if (this.getCommandUseCount(baseCommand) >= 6) {
          newLevel = CommandMastery.INTERMEDIATE;
        }
        break;
      case CommandMastery.INTERMEDIATE:
        if (this.getCommandUseCount(baseCommand) >= 11) {
          newLevel = CommandMastery.ADVANCED;
        }
        break;
      case CommandMastery.ADVANCED:
        if (this.getCommandUseCount(baseCommand) >= 20) {
          newLevel = CommandMastery.EXPERT;
        }
        break;
    }

    // Update mastery level if it changed
    if (newLevel !== currentLevel) {
      this.gameState.commandMastery.set(baseCommand, newLevel);
      this.emit("masteryLevelChanged", {
        command: baseCommand,
        level: newLevel,
      });

      // Check if we should advance to the next stage
      this.checkProgressionStage();
    }
  }

  /**
   * Get the total number of times a command has been used
   */
  private getCommandUseCount(command: string): number {
    return this.gameState.commandHistory.filter(
      (cmd) => cmd.split(" ")[0] === command
    ).length;
  }

  /**
   * Check if we should advance to the next progression stage
   */
  private checkProgressionStage(): void {
    const currentStage = this.gameState.currentStage;
    const commands =
      COMMAND_PROGRESSION[currentStage as keyof typeof COMMAND_PROGRESSION];

    // Check if all commands in the current stage are at least at BEGINNER level
    const allMastered = commands.every(
      (cmd) =>
        (this.gameState.commandMastery.get(cmd) || CommandMastery.UNKNOWN) >=
        CommandMastery.BEGINNER
    );

    if (allMastered) {
      // Advance to the next stage
      switch (currentStage) {
        case "NAVIGATION":
          this.gameState.currentStage = "FILE_OPERATIONS";
          break;
        case "FILE_OPERATIONS":
          this.gameState.currentStage = "TEXT_PROCESSING";
          break;
        case "TEXT_PROCESSING":
          this.gameState.currentStage = "ADVANCED";
          break;
        case "ADVANCED":
          this.gameState.currentStage = "NETWORKING";
          break;
      }

      // Emit event for stage change
      if (this.gameState.currentStage !== currentStage) {
        this.emit("stageAdvanced", {
          previousStage: currentStage,
          newStage: this.gameState.currentStage,
        });
      }
    }
  }

  /**
   * Get a description of the user's command mastery levels
   */
  private getCommandMasteryDescription(): string {
    const masteryText = [];

    // Group commands by mastery level
    const commandsByLevel = new Map<CommandMastery, string[]>();

    this.gameState.commandMastery.forEach((level, command) => {
      if (!commandsByLevel.has(level)) {
        commandsByLevel.set(level, []);
      }
      commandsByLevel.get(level)?.push(command);
    });

    // Generate description
    for (
      let level = CommandMastery.EXPERT;
      level >= CommandMastery.NOVICE;
      level--
    ) {
      const commands = commandsByLevel.get(level);
      if (commands && commands.length > 0) {
        const levelName = CommandMastery[level];
        masteryText.push(`${levelName}: ${commands.join(", ")}`);
      }
    }

    return masteryText.join("\n");
  }

  /**
   * Set the expected next command
   */
  public setExpectedCommand(command: string): void {
    this.gameState.expectedCommand = command;
  }
}
