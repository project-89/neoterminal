import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Special command for acknowledging the first narrative prompt
 */
export class AcknowledgeCommand implements Command {
  public readonly name = "acknowledge";
  public readonly aliases = ["ack"];
  public readonly description =
    "Acknowledge the system prompt with the code phrase";
  public readonly usage = "acknowledge";
  public readonly examples = [
    "acknowledge - Respond with 'I SEE THE CODE BEHIND THE WORLD'",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    try {
      // Send the acknowledgement phrase to the narrative manager
      const response = await this.narrativeManager.processUserMessage(
        "I SEE THE CODE BEHIND THE WORLD"
      );

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
            : "Unknown error processing acknowledgement",
      };
    }
  }
}
