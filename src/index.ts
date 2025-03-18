import { CommandRegistry } from "./core/CommandRegistry";
import { CommandProcessor } from "./core/CommandProcessor";
import { VirtualFileSystem } from "./filesystem/VirtualFileSystem";
import { SkillTracker } from "./skills/SkillTracker";
import { TerminalEmulator } from "./terminal/TerminalEmulator";
import { registerCommands } from "./commands";
import { MissionManager } from "./missions/MissionManager";
import { initialMissions } from "./missions/initial-missions";
import { AIServiceManager } from "./ai";
import { loadConfig } from "./ai/config";

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Initialize AI service
    const aiConfig = loadConfig();
    console.log(`Initializing AI service with provider: ${aiConfig.provider}`);
    await AIServiceManager.initializeService(aiConfig);

    // Create core system components
    const filesystem = new VirtualFileSystem();
    const commandRegistry = new CommandRegistry();
    const skillTracker = new SkillTracker("user");
    const commandProcessor = new CommandProcessor(commandRegistry, filesystem);
    const terminal = new TerminalEmulator(commandProcessor);

    // Initialize mission manager with skill tracker for dynamic difficulty
    const missionManager = new MissionManager(filesystem, skillTracker);

    // Register commands
    registerCommands(commandRegistry, missionManager, skillTracker);

    // Initialize missions
    initialMissions.forEach((mission) => {
      missionManager.registerMission(mission);
    });

    // Prepare test file for missions
    filesystem.writeFile(
      "/home/user/docs/security.txt",
      "SECURITY ADVISORY\n" +
        "================\n\n" +
        "CLASSIFICATION: LEVEL 3 - RESTRICTED\n\n" +
        "The PANOPTICON system has implemented new security measures.\n" +
        "All operatives are advised to use secure communication channels\n" +
        "and maintain proper digital hygiene at all times.\n\n" +
        "Remember: They are always watching. Stay in the shadows.\n\n" +
        "-- GHOST//SIGNAL COLLECTIVE"
    );

    // Create test files for the Ghost Protocol mission
    filesystem.mkdir("/home/user/workspace");
    filesystem.writeFile(
      "/home/user/workspace/test_file.txt",
      "This is a test file that should be removed"
    );
    filesystem.mkdir("/home/user/workspace/test_dir");
    filesystem.writeFile(
      "/home/user/workspace/test_dir/secret.txt",
      "This is a secret file"
    );

    // Connect event listeners
    commandProcessor.on("command-executed", (context) => {
      skillTracker.recordCommandExecution(context);

      // Check mission objectives for command executions
      missionManager.getActiveMissions().forEach((mission) => {
        let allObjectivesCompleted = true;
        let objectiveCompleted = false;

        mission.objectives.forEach((objective) => {
          if (objective.type === "execute_command") {
            if (context.command === objective.command) {
              if (
                !objective.args ||
                (context.args.length > 0 &&
                  context.args.join(" ").includes(objective.args))
              ) {
                objectiveCompleted = true;
              }
            }
          }

          // More objective checks could be added here

          // If any objective is not completed, the mission is not complete
          // This is a simplified version - in a real app, we'd track individual objective completion
          if (!objectiveCompleted) {
            allObjectivesCompleted = false;
          }
        });

        if (allObjectivesCompleted) {
          console.log(`\n${mission.debriefing}\n`);
          missionManager.completeMission(mission.id);
          skillTracker.recordMissionCompletion(mission.id);

          // Recalculate difficulty for any unlocked missions
          if (mission.nextMissions) {
            mission.nextMissions.forEach((nextMissionId) => {
              if (missionManager.getMission(nextMissionId)) {
                missionManager.calculateDifficultyModifier(nextMissionId);
              }
            });
          }
        }
      });
    });

    // Listen for mission events for enhanced visual feedback
    missionManager.on("mission-started", ({ missionId, mission }) => {
      const difficultyModifier =
        missionManager.getDifficultyModifier(missionId);
      let difficultyText = "";

      if (difficultyModifier < 0.9) {
        difficultyText =
          "\n[DIFFICULTY: LOWERED] This mission has been adjusted to match your skill level.";
      } else if (difficultyModifier > 1.1) {
        difficultyText =
          "\n[DIFFICULTY: INCREASED] This mission has been adjusted to challenge your skills.";
      }

      console.log(`\n== MISSION ACTIVATED: ${mission.title} ==`);
      console.log(
        `Difficulty: ${"★".repeat(Math.round(mission.difficulty))}${"☆".repeat(
          5 - Math.round(mission.difficulty)
        )}`
      );
      console.log(
        `Estimated Time: ${mission.estimatedTime} minutes${difficultyText}\n`
      );
    });

    missionManager.on("mission-completed", ({ missionId, mission }) => {
      console.log(`\n== MISSION COMPLETE: ${mission.title} ==`);
      console.log("[ SKILL PROGRESS UPDATED ]\n");

      const profile = skillTracker.getSkillProfile();
      console.log(
        `Current Level: ${getSkillLevelName(profile.overallLevel)}\n`
      );
    });

    missionManager.on(
      "mission-requirements-not-met",
      ({ missionId, mission, requiredLevel, userLevel }) => {
        console.log(`\n== MISSION ACCESS DENIED: ${mission.title} ==`);
        console.log(
          `Your current level (${getSkillLevelName(
            userLevel
          )}) is insufficient.`
        );
        console.log(`Required level: ${getSkillLevelName(requiredLevel)}`);
        console.log("Complete other missions to improve your skills first.\n");
      }
    );

    // Set up error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
    });

    // Initialize terminal
    await terminal.initialize();

    // Custom cyberpunk-style prompt
    terminal.setPrompt("ghost@signal:~$");

    console.log("NEOTERMINAL initialized successfully.");
    console.log('Type "help" to see available commands.');
    console.log('Type "missions" to see your available missions.\n');

    // Start the first mission automatically
    missionManager.startMission("mission_001");

    const firstMission = missionManager.getMission("mission_001");
    if (firstMission) {
      console.log(firstMission.asciiArt);
      console.log(`Mission: ${firstMission.title}`);
      console.log(`Status: ACTIVE\n`);
      console.log(firstMission.briefing);

      console.log("\nObjectives:");
      firstMission.objectives.forEach((objective, index) => {
        if (objective.type === "execute_command") {
          console.log(
            `  ${index + 1}. Execute command: ${objective.command}${
              objective.args ? " " + objective.args : ""
            }${objective.count ? " (" + objective.count + " times)" : ""}`
          );
        }
      });
      console.log();
    }
  } catch (error) {
    console.error("Failed to initialize NEOTERMINAL:", error);
    process.exit(1);
  }
}

/**
 * Get the skill level name from the enum value
 */
function getSkillLevelName(level: number): string {
  switch (level) {
    case 1:
      return "INITIATE";
    case 2:
      return "OPERATOR";
    case 3:
      return "NETRUNNER";
    case 4:
      return "GHOST";
    case 5:
      return "ARCHITECT";
    default:
      return "UNKNOWN";
  }
}

// Run the application
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
