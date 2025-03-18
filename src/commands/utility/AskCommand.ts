import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { AIServiceManager } from "../../ai";
import { SkillTracker } from "../../skills/SkillTracker";

/**
 * Command to ask questions to the AI assistant
 */
export class AskCommand implements Command {
  name = "ask";
  aliases = ["ai", "assistant"];
  category = CommandCategory.UTILITY;
  description = "Ask a question or get help from the AI assistant";
  usage = "ask <question>";
  examples = [
    "ask how do I list hidden files",
    "ask what should I do next in this mission",
    "ask explain the grep command",
  ];
  skillLevel = SkillLevel.INITIATE;
  private skillTracker: SkillTracker;

  constructor(skillTracker: SkillTracker) {
    this.skillTracker = skillTracker;
  }

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    if (args.length === 0) {
      return {
        success: false,
        error: "Please provide a question or request for the AI assistant",
      };
    }

    // Join all arguments as the question text
    const question = args.join(" ");

    try {
      // Check if AI service is available
      if (!AIServiceManager.hasInitializedService()) {
        return {
          success: false,
          error: "AI assistant is not available. Check your configuration.",
        };
      }

      const aiService = AIServiceManager.getCurrentService();

      // Get the user's skill profile from the tracker
      const skillProfile = this.skillTracker.getSkillProfile();

      // Get recent command history (mock for now, but could be expanded later)
      const commandHistory = this.getRecentCommands(10);

      // Analyze the question
      const response = await aiService.analyzeCommand({
        userInput: question,
        commandHistory,
        skillProfile,
        context: {
          currentDirectory: options.currentDirectory,
        },
      });

      // Format the response
      if (response.error) {
        return {
          success: false,
          error: `AI Error: ${response.error}`,
        };
      }

      const output = [];

      if (response.suggestion) {
        output.push("SUGGESTION:");
        output.push(response.suggestion);
        output.push("");
      }

      if (response.feedback) {
        output.push("FEEDBACK:");
        output.push(response.feedback);
        output.push("");
      }

      if (response.skillAssessment?.recommendedCommands?.length) {
        output.push("RECOMMENDED COMMANDS:");
        output.push(response.skillAssessment.recommendedCommands.join(", "));
        output.push("");
      }

      if (output.length === 0) {
        output.push("No relevant information found.");
      }

      return {
        success: true,
        output: output.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process your request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get recent command history
   * In a real implementation, this would access the terminal history
   */
  private getRecentCommands(limit: number): string[] {
    // For now, we'll return a simple array since we don't have direct access to the terminal history
    // In a production implementation, this would connect to the terminal's command history
    return ["pwd", "ls -la", "cd /home/user", "cat README.txt", "help"].slice(
      -limit
    );
  }
}
