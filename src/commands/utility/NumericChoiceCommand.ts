import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Special command handler that intercepts numeric inputs (1, 2, 3)
 * and treats them as narrative choices.
 */
export class NumericChoiceCommand implements Command {
  public readonly name = "_numeric";
  public readonly description = "Make narrative choices using numeric inputs";
  public readonly usage = "<number>";
  public readonly examples = [
    "1 - Select the first choice",
    "2 - Select the second choice",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    // Get the original input
    const input = context.originalCommand || "";

    // Check if it's a numeric choice (just a number)
    const choiceNum = input.trim();
    if (!/^\d+$/.test(choiceNum)) {
      return {
        success: false,
        error: `Invalid numeric choice: ${input}`,
      };
    }

    // Convert to choice index (convert from 1-based to 0-based)
    const choiceIndex = parseInt(choiceNum, 10) - 1;
    const choices = this.narrativeManager.getAvailableChoices();

    if (choiceIndex < 0 || choiceIndex >= choices.length) {
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
        error: "Failed to make the choice.",
      };
    }

    // Get the new node after making the choice
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
        const isCommandChoice = (choice as any).requires_command;
        if (isCommandChoice) {
          output += `${index + 1}. Type the command: ${
            (choice as any).requires_command
          }\n`;
        } else {
          output += `${index + 1}. ${choice.text}\n`;
        }
      });

      if (!newChoices.some((c) => (c as any).requires_command)) {
        output +=
          "\nTo make a choice, enter the number or use: choice <number>";
      }
    } else {
      output += "No choices available. Type 'narrative' to continue.";
    }

    return {
      success: true,
      output,
    };
  }
}
