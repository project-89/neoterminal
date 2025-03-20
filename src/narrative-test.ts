import { NarrativeManager } from "./narrative/NarrativeManager";

/**
 * NEOTERMINAL - Narrative System Test Harness
 * This file demonstrates the usage of the narrative system
 */

// Initialize the narrative system
const narrative = new NarrativeManager();

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

      rl.question("Enter choice number: ", (answer: string) => {
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
      });
    }

    promptChoice();
  } else {
    console.error("Failed to start the narrative.");
  }
}

// Start the CLI if this file is run directly
if (require.main === module) {
  startCLI();
}

// Export for programmatic usage
export { narrative, makeChoice, displayNarrativeContent };
