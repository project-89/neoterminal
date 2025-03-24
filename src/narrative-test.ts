import { NarrativeManager } from "./narrative/NarrativeManager";
import { NarrativeChoice } from "./narrative/NarrativeChoice";

/**
 * NEOTERMINAL - Narrative System Test Harness
 * This file demonstrates the usage of the narrative system
 */

// Initialize the narrative system
console.log("Creating NarrativeManager instance...");
const narrative = new NarrativeManager();

// Add delay to ensure async operations complete before starting
setTimeout(async () => {
  console.log("\n--- DEBUG INFO ---");
  try {
    const chapters = narrative.getAllChapters();
    console.log(`Available chapters: ${chapters.length}`);
    if (chapters.length > 0) {
      chapters.forEach((chapter) => {
        console.log(`- ${chapter.id}: ${chapter.title}`);
      });
    } else {
      console.log(
        "No chapters found. This might be why the narrative can't start."
      );
    }

    const firstChapter = narrative.getChapter("chapter_001");
    if (firstChapter) {
      console.log(`First chapter found: ${firstChapter.title}`);
      console.log(`Starting node: ${firstChapter.startingNodeId}`);

      // Instead of directly accessing nodeManager, check if there are nodes for this chapter indirectly
      const currentNode = narrative.getCurrentNode();
      console.log(`Current node: ${currentNode ? currentNode.id : "None"}`);
    } else {
      console.log("Chapter 'chapter_001' not found!");
    }
  } catch (err) {
    console.error("Error in debug section:", err);
  }
  console.log("--- END DEBUG ---\n");

  // Continue with the narrative test...
  startCLI();
}, 1000);

// Helper function to display narrative content
function displayNarrativeContent(): void {
  const currentNode = narrative.getCurrentNode();
  if (!currentNode) {
    console.log("No active narrative node.");
    return;
  }

  console.log("\n==================================================");
  console.log(`CHAPTER: ${currentNode.chapterId} | NODE: ${currentNode.id}`);
  console.log(`TITLE: ${currentNode.title}`);
  console.log("==================================================\n");

  const speaker = narrative.getCurrentSpeaker();
  if (speaker) {
    console.log(`[${speaker.name}]:`);
  }

  console.log(currentNode.content);
  console.log("\n--------------------------------------------------");

  const choices = narrative.getAvailableChoices();
  if (choices.length === 0) {
    console.log("No available choices. (End of branch)");
  } else {
    console.log("CHOICES:");
    choices.forEach((choice, index) => {
      console.log(`${index + 1}. ${choice.text}`);
    });
  }

  console.log("==================================================\n");
}

// Example of advancing the narrative (in a real app, this would be triggered by user input)
function makeChoice(choiceIndex: number): void {
  const choices = narrative.getAvailableChoices();
  if (choiceIndex < 0 || choiceIndex >= choices.length) {
    console.error("Invalid choice index.");
    return;
  }

  const choice = choices[choiceIndex];
  console.log(`\nYou selected: ${choice.text}\n`);

  if (narrative.makeChoice(choice.id)) {
    displayNarrativeContent();
  } else {
    console.error("Failed to make the choice.");
  }
}

// Simple command-line interface for testing
function startCLI(): void {
  console.log("GHOST//SIGNAL Narrative System - Test Mode");

  // Start the first chapter
  console.log("Attempting to start chapter_001...");
  if (narrative.startChapter("chapter_001")) {
    console.log("Starting Chapter 1: The Awakening");
    displayNarrativeContent();

    // Set up readline for input
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function promptChoice(): void {
      const choices = narrative.getAvailableChoices();
      if (choices.length === 0) {
        console.log("End of narrative branch reached. Exiting.");
        rl.close();
        return;
      }

      // Check if any choices require commands
      const hasCommandChoices = choices.some(
        (choice) => (choice as any).requires_command
      );

      if (hasCommandChoices) {
        console.log(
          "\nThis scene requires you to enter a terminal command rather than selecting a number."
        );
        console.log(
          "Type the appropriate command based on the context above.\n"
        );
      }

      rl.question(
        hasCommandChoices ? "Enter command: " : "Enter choice number: ",
        (answer: string) => {
          // For command-based choices
          if (hasCommandChoices) {
            // Find a choice that matches the entered command
            const matchingChoice = choices.find(
              (choice) =>
                (choice as any).requires_command &&
                answer.trim() === (choice as any).requires_command
            );

            if (matchingChoice) {
              makeChoice(choices.indexOf(matchingChoice));
              promptChoice();
              return;
            } else {
              console.log(
                "Command not recognized or incorrect. Try again or check the syntax."
              );
              promptChoice();
              return;
            }
          }

          // For regular numeric choices
          const choiceIndex = parseInt(answer, 10) - 1;
          if (
            isNaN(choiceIndex) ||
            choiceIndex < 0 ||
            choiceIndex >= choices.length
          ) {
            console.log("Invalid choice. Please try again.");
            promptChoice();
            return;
          }

          makeChoice(choiceIndex);
          promptChoice();
        }
      );
    }

    promptChoice();
  } else {
    console.error("Failed to start the narrative.");
    console.log("Debug: Let's see what's available in the system:");

    // Check if we can access chapters
    const chapters = narrative.getAllChapters();
    console.log(`Total chapters: ${chapters.length}`);

    // Try to get the first chapter directly
    const firstChapter = narrative.getChapter("chapter_001");
    console.log(`First chapter available: ${firstChapter ? "Yes" : "No"}`);
  }
}

// Export for programmatic usage
export { narrative, makeChoice, displayNarrativeContent };
