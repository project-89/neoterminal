import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Command for interacting with the AI-driven narrative system
 */
export class NarrativeCommand implements Command {
  public readonly name = "narrative";
  public readonly aliases = ["story", "continue"];
  public readonly description = "Interact with the narrative system";
  public readonly usage = "narrative [message]";
  public readonly examples = [
    "narrative - Continue the story",
    "narrative I want to hack the system - Send a specific message to the narrative system",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    // Combine args into a message if provided
    const message = args.length > 0 ? args.join(" ") : "Continue the story";

    try {
      // Process the user's message through the narrative manager
      const response = await this.narrativeManager.processUserMessage(message);

      // Look for any suggested next commands in the response
      this.extractExpectedCommand(response);

      return {
        success: true,
        output: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error processing narrative",
      };
    }
  }

  /**
   * Extract expected command from the narrative response
   * This looks for patterns like "try the command `ls`" or "use `cd documents`"
   */
  private extractExpectedCommand(response: string): void {
    // Common patterns for command suggestions
    const patterns = [
      /try (?:the )?(?:command )?[`'"]([\w\s\-\.\/]+)[`'"]/i,
      /use (?:the )?(?:command )?[`'"]([\w\s\-\.\/]+)[`'"]/i,
      /type [`'"]([\w\s\-\.\/]+)[`'"]/i,
      /run [`'"]([\w\s\-\.\/]+)[`'"]/i,
      /execute [`'"]([\w\s\-\.\/]+)[`'"]/i,
    ];

    // Try each pattern to find a match
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        console.log(
          `[NarrativeCommand] Detected suggested command: ${match[1]}`
        );
        this.narrativeManager.setExpectedCommand(match[1]);
        break;
      }
    }
  }
}
