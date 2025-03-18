import { SkillProfile } from "../../../types";
import { AIAnalysisRequest, AIAnalysisResponse } from "../AIService";
import { BaseAIService } from "../BaseAIService";

/**
 * Local AI service that doesn't require external API calls
 * Uses predefined responses and rules for basic feedback
 */
export class LocalAIService extends BaseAIService {
  private commandHints: Map<string, string> = new Map();
  private commandFeedback: Map<string, string[]> = new Map();
  private missionHints: Map<string, Map<number, string>> = new Map();

  /**
   * Analyze a user command
   */
  public async analyzeCommand(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      // Initialize hints and feedback maps if this is the first call
      if (this.commandHints.size === 0) {
        this.initializeHintsAndFeedback();
      }

      const inputParts = request.userInput.split(" ");
      const command = inputParts[0];

      // Get suggestion based on command
      const suggestion =
        this.commandHints.get(command) ||
        "Try exploring other commands with 'help' to learn more.";

      // Get feedback based on command history and current command
      const feedback = this.generateFeedback(command, request.commandHistory);

      return {
        suggestion,
        feedback,
        skillAssessment: {
          commandProficiency: this.estimateProficiency(
            command,
            request.skillProfile
          ),
          recommendedCommands: this.getRecommendedCommands(
            command,
            request.skillProfile
          ),
          suggestedNextSteps: ["Use 'help' to explore more commands"],
        },
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error with local analysis",
      };
    }
  }

  /**
   * Generate a hint for the current mission objective
   */
  public async generateHint(
    missionId: string,
    objectiveIndex: number,
    context: Record<string, any>
  ): Promise<string> {
    // Initialize hints map if this is the first call
    if (this.missionHints.size === 0) {
      this.initializeMissionHints();
    }

    // Get mission hints
    const missionHintMap = this.missionHints.get(missionId);

    if (missionHintMap && missionHintMap.has(objectiveIndex)) {
      return missionHintMap.get(objectiveIndex) || "No hint available.";
    }

    // Default hints based on mission ID
    if (missionId.includes("navigation")) {
      return "Navigation missions typically require using commands like cd, ls, and pwd.";
    } else if (missionId.includes("file")) {
      return "File operation missions require commands like cat, touch, mkdir, and rm.";
    }

    return "Try using the 'help' command to see what commands are available.";
  }

  /**
   * Generate narrative content
   */
  public async generateNarrative(
    context: Record<string, any>
  ): Promise<string> {
    // Simple narratives based on progress
    const completedMissions = context.completedMissions || [];
    const progress = completedMissions.length;

    if (progress === 0) {
      return "The neon city stretches out before you, a labyrinth of data and secrets. Your journey as a netrunner is just beginning.";
    } else if (progress < 3) {
      return "The digital pathways become more familiar with each mission. The system's defenses recognize your signature now, but you're becoming more adept at slipping through unnoticed.";
    } else if (progress < 5) {
      return "Ghost in the machine. You're starting to leave your mark in the system. The corporate ICE has been modified to counter your techniques, but you're always one step ahead.";
    } else {
      return "Your reputation in the underground networks grows. What once seemed like impenetrable walls of code now appear as familiar landscapes. You navigate through the digital realm like a true cyberpunk ghost.";
    }
  }

  /**
   * Assess user skills
   */
  public async assessSkills(
    skillProfile: SkillProfile
  ): Promise<Record<string, number>> {
    const assessments: Record<string, number> = {};

    skillProfile.commandProficiency.forEach((proficiency, command) => {
      // Simple assessment based on execution count and success rate
      const executions = proficiency.executionCount;
      const successes = proficiency.successfulExecutions;
      const successRate = executions > 0 ? successes / executions : 0;

      // Calculate a score based on success rate and number of executions
      const score = Math.min(
        100,
        Math.round(successRate * 70 + Math.min(30, executions * 3))
      );

      assessments[command] = score;
    });

    return assessments;
  }

  /**
   * Validate the configuration
   */
  protected async validateConfig(): Promise<boolean> {
    // Local service doesn't require external configuration
    return true;
  }

  /**
   * Initialize command hints and feedback
   */
  private initializeHintsAndFeedback(): void {
    // Command hints
    this.commandHints.set(
      "ls",
      "Try using ls with flags like -l or -a to see more details or hidden files."
    );
    this.commandHints.set(
      "cd",
      "Remember that cd .. takes you up one directory level."
    );
    this.commandHints.set(
      "pwd",
      "pwd helps you know where you are - essential before making file changes."
    );
    this.commandHints.set(
      "mkdir",
      "After creating a directory with mkdir, use cd to navigate into it."
    );
    this.commandHints.set(
      "touch",
      "touch can create empty files which you can later edit."
    );
    this.commandHints.set(
      "rm",
      "Be careful with rm! Use rm -r for directories and rm -f to force deletion."
    );
    this.commandHints.set(
      "cat",
      "cat is great for viewing file contents. For longer files, consider using less."
    );
    this.commandHints.set(
      "help",
      "Specific help is available with 'help command_name'."
    );
    this.commandHints.set(
      "missions",
      "You can use 'missions start mission_id' to begin a new mission."
    );

    // Command feedback templates
    this.commandFeedback.set("ls", [
      "Good use of the ls command to explore your environment.",
      "You're becoming more familiar with directory exploration.",
      "Navigating the system like a pro.",
    ]);

    this.commandFeedback.set("cd", [
      "You're moving through the directories efficiently.",
      "Mastering navigation is essential for cyber operations.",
      "Your directory traversal skills are improving.",
    ]);

    this.commandFeedback.set("cat", [
      "Good information gathering technique.",
      "Reading files is critical for successful missions.",
      "You're extracting data effectively.",
    ]);

    this.commandFeedback.set("rm", [
      "You're cleaning up your tracks.",
      "Removing evidence is a key hacker skill.",
      "Ghost protocol in action - leaving no trace.",
    ]);
  }

  /**
   * Initialize mission hints
   */
  private initializeMissionHints(): void {
    // Mission 001: System Calibration
    const mission001Hints = new Map<number, string>();
    mission001Hints.set(
      0,
      "Try using the 'pwd' command to print your current working directory."
    );
    mission001Hints.set(
      1,
      "The 'ls' command will list the contents of the current directory."
    );
    mission001Hints.set(
      2,
      "Use 'cd /home/user/missions' to navigate to the missions directory."
    );
    this.missionHints.set("mission_001", mission001Hints);

    // Mission 002: Data Retrieval
    const mission002Hints = new Map<number, string>();
    mission002Hints.set(
      0,
      "Look for the security.txt file in the docs directory. Use 'cat' to read its contents."
    );
    this.missionHints.set("mission_002", mission002Hints);

    // Mission 003: Digital Footprints
    const mission003Hints = new Map<number, string>();
    mission003Hints.set(
      0,
      "The 'mkdir' command creates a new directory. Try 'mkdir /home/user/workspace'."
    );
    mission003Hints.set(
      1,
      "Use 'touch' to create an empty file, like 'touch /home/user/workspace/notes.txt'."
    );
    this.missionHints.set("mission_003", mission003Hints);

    // Mission 004: Ghost Protocol
    const mission004Hints = new Map<number, string>();
    mission004Hints.set(
      0,
      "Remove the test file using 'rm /home/user/workspace/test_file.txt'."
    );
    mission004Hints.set(
      1,
      "For directories, you need to use 'rm -r' to remove recursively."
    );
    this.missionHints.set("mission_004", mission004Hints);
  }

  /**
   * Generate feedback based on command and history
   */
  private generateFeedback(command: string, history: string[]): string {
    // Get feedback templates for this command
    const feedbackTemplates = this.commandFeedback.get(command) || [
      "Keep exploring the system.",
      "Try different commands to build your skills.",
      "Every command execution increases your proficiency.",
    ];

    // Choose a random feedback message
    const index = Math.floor(Math.random() * feedbackTemplates.length);
    return feedbackTemplates[index];
  }

  /**
   * Estimate proficiency based on command usage
   */
  private estimateProficiency(command: string, profile: SkillProfile): number {
    const proficiency = profile.commandProficiency.get(command);

    if (proficiency) {
      return proficiency.proficiencyScore;
    }

    // Default proficiency for unused commands
    return 10; // Beginner level
  }

  /**
   * Get recommended commands based on current command and skill profile
   */
  private getRecommendedCommands(
    command: string,
    profile: SkillProfile
  ): string[] {
    // Navigation command recommendations
    if (command === "cd" || command === "pwd") {
      return ["ls", "find", "tree"];
    }

    // File viewing recommendations
    if (command === "ls" || command === "cat") {
      return ["grep", "head", "tail"];
    }

    // File creation recommendations
    if (command === "touch" || command === "mkdir") {
      return ["cp", "mv", "echo"];
    }

    // File deletion recommendations
    if (command === "rm") {
      return ["rmdir", "find", "xargs"];
    }

    // General recommendations
    return ["grep", "find", "chmod"];
  }
}
