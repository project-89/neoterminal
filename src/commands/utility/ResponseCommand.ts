import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Command for handling direct user input in the narrative
 * This will process any freeform input when it doesn't match a normal command
 */
export class ResponseCommand implements Command {
  public readonly name = "_response";
  public readonly description = "Process narrative responses";
  public readonly usage = "[any text]";
  public readonly examples = [
    '"I SEE THE CODE BEHIND THE WORLD" - Responding to narrative prompts',
    '"tell me more about the protocol" - Asking questions to characters',
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  // Special phrases that trigger narrative responses
  private specialPhrases: { [key: string]: string } = {
    "i see the code behind the world": "I SEE THE CODE BEHIND THE WORLD",
  };

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    // Get the original, unprocessed input text
    const fullInput = context.originalCommand || args.join(" ");

    if (!fullInput.trim()) {
      return {
        success: false,
        error: "Please enter a response.",
      };
    }

    // Process the input by removing quotes if present
    let processedInput = fullInput.trim();

    // Remove surrounding quotes if present
    if (
      (processedInput.startsWith("'") && processedInput.endsWith("'")) ||
      (processedInput.startsWith('"') && processedInput.endsWith('"'))
    ) {
      processedInput = processedInput
        .substring(1, processedInput.length - 1)
        .trim();
    }

    // Also trim any "TO PROCEED" or similar trailing phrases
    if (processedInput.toLowerCase().includes(" to proceed")) {
      processedInput = processedInput
        .substring(0, processedInput.toLowerCase().indexOf(" to proceed"))
        .trim();
    }

    console.log(`Processing input: "${processedInput}"`);

    // Check for special phrases (case insensitive)
    const lowerInput = processedInput.toLowerCase();
    for (const [phrase, standardizedPhrase] of Object.entries(
      this.specialPhrases
    )) {
      // More flexible matching - allow slight variations in the phrase
      if (
        lowerInput === phrase ||
        lowerInput.includes(phrase) ||
        phrase.includes(lowerInput)
      ) {
        console.log(`Special phrase detected: "${standardizedPhrase}"`);

        try {
          // Process the standardized phrase through the narrative manager
          const response = await this.narrativeManager.processUserMessage(
            standardizedPhrase
          );

          // Extract expected command from the response
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
                : "Error processing special phrase",
          };
        }
      }
    }

    // For regular input
    try {
      // Process the user's direct response through the narrative manager
      const response = await this.narrativeManager.processUserMessage(
        processedInput
      );

      // Extract expected command from the response
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
            : "Unknown error processing your response",
      };
    }
  }

  /**
   * Extract expected command from the narrative response
   * This looks for patterns like "try the command `ls`" or "use `cd documents`"
   */
  private extractExpectedCommand(response: string): void {
    // Use the narrativeManager's method to extract commands
    if (typeof this.narrativeManager.extractExpectedCommand === "function") {
      this.narrativeManager.extractExpectedCommand(response);
    }
  }
}
