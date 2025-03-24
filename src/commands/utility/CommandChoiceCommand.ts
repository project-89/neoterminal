import {
  Command,
  CommandResult,
  CommandCategory,
  SkillLevel,
} from "../../../types";
import { NarrativeManager } from "../../narrative/NarrativeManager";

/**
 * Special command handler that intercepts all command executions
 * and checks if they match a command-based narrative choice.
 *
 * This is designed to be registered last so it acts as a fallback
 * when no other command matches.
 */
export class CommandChoiceCommand implements Command {
  public readonly name = "_fallback";
  public readonly description = "Handle command-based narrative choices";
  public readonly usage = "<command>";
  public readonly examples = [
    "ls - Execute 'ls' command or use it as a narrative choice if applicable",
    "cd documents - Execute 'cd' or use it as a narrative choice if applicable",
  ];
  public readonly category = CommandCategory.UTILITY;
  public readonly skillLevel = SkillLevel.INITIATE;

  private narrativeManager: NarrativeManager;

  constructor(narrativeManager: NarrativeManager) {
    this.narrativeManager = narrativeManager;
  }

  public async execute(args: string[], context: any): Promise<CommandResult> {
    // Get the original command string
    const command = context.originalCommand || args[0] || "";

    // Check if there's an active narrative with command-based choices
    const choices = this.narrativeManager.getAvailableChoices();

    // Look for a choice that requires this exact command
    const matchingChoice = choices.find((choice) => {
      const requiresCommand = (choice as any).requires_command;
      return requiresCommand && requiresCommand === command;
    });

    if (!matchingChoice) {
      return {
        success: false,
        error: `Command not found: ${command}`,
      };
    }

    // We found a matching command-based choice! Execute it
    const success = this.narrativeManager.makeChoice(matchingChoice.id);
    if (!success) {
      return {
        success: false,
        error:
          "Failed to execute the command as a narrative choice. The narrative system may have encountered an error.",
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
        output += "\nTo make a choice, use: choice <number>";
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
