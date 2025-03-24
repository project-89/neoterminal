import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Command for making choices in the narrative system
 */
export class ChoiceCommand implements Command {
  public readonly name = "choice";
  public readonly description = "Make a choice in the narrative system";
  public readonly usage = "choice <number>";
  public readonly examples = [
    "choice 1 - Select the first choice",
    "choice 2 - Select the second choice",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    if (!args.length) {
      return {
        success: false,
        error: "Please specify a choice number. Usage: choice <number>",
      };
    }

    const choiceIndex = parseInt(args[0], 10) - 1; // Convert to 0-based index
    const choices = this.narrativeManager.getAvailableChoices();

    if (
      isNaN(choiceIndex) ||
      choiceIndex < 0 ||
      choiceIndex >= choices.length
    ) {
      return {
        success: false,
        error: `Invalid choice number. Available choices: 1-${choices.length}`,
      };
    }

    const choice = choices[choiceIndex];

    // Check if this is a command-based choice
    const requiresCommand = (choice as any).requires_command;
    if (requiresCommand) {
      return {
        success: false,
        error: `This choice requires you to type a command: ${requiresCommand}`,
      };
    }

    // Make the choice
    const success = this.narrativeManager.makeChoice(choice.id);
    if (!success) {
      return {
        success: false,
        error:
          "Failed to make the choice. The narrative system may have encountered an error.",
      };
    }

    // Get the new node
    const newNode = this.narrativeManager.getCurrentNode();
    if (!newNode) {
      return {
        success: true,
        output: "End of narrative reached.",
      };
    }

    // Format the new node content
    const speaker = this.narrativeManager.getCurrentSpeaker();
    let output = `
╔════════════════════════════════════════════════════════╗
║                    GHOST//SIGNAL                       ║
╚════════════════════════════════════════════════════════╝

${newNode.title}

`;

    if (speaker) {
      output += `[${speaker.name}]: `;
    }

    output += `${newNode.content}\n\n`;

    // Add choices
    const newChoices = this.narrativeManager.getAvailableChoices();
    if (newChoices.length > 0) {
      output += "CHOICES:\n";
      newChoices.forEach((choice, index) => {
        output += `${index + 1}. ${choice.text}\n`;
      });
      output += "\nTo make a choice, use: choice <number>";
    } else {
      output += "No choices available. Type 'narrative' to continue.";
    }

    return {
      success: true,
      output,
    };
  }
}
