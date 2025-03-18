import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { AIServiceManager } from "../../ai";
import { MissionManager } from "../../missions/MissionManager";

/**
 * Command to get hints for the current mission from the AI assistant
 */
export class HintCommand implements Command {
  name = "hint";
  aliases = ["hints"];
  category = CommandCategory.UTILITY;
  description = "Get a hint for your current mission objective";
  usage = "hint [mission_id] [objective_index]";
  examples = ["hint", "hint mission_001", "hint mission_002 1"];
  skillLevel = SkillLevel.INITIATE;
  private missionManager: MissionManager;

  constructor(missionManager: MissionManager) {
    this.missionManager = missionManager;
  }

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    try {
      // Check if AI service is available
      if (!AIServiceManager.hasInitializedService()) {
        return {
          success: false,
          error: "AI assistant is not available. Check your configuration.",
        };
      }

      // Determine which mission to get a hint for
      const activeMissions = this.missionManager.getActiveMissions();

      if (activeMissions.length === 0) {
        return {
          success: false,
          error:
            "No active missions. Start a mission first with 'missions start <mission_id>'",
        };
      }

      // Default to the first active mission
      let missionId = activeMissions[0].id;
      let objectiveIndex = 0;

      // If mission ID is specified
      if (args.length > 0) {
        missionId = args[0];

        // Verify that the mission exists
        const mission = this.missionManager.getMission(missionId);
        if (!mission) {
          return {
            success: false,
            error: `Mission '${missionId}' not found`,
          };
        }

        // Verify that the mission is active
        if (!this.missionManager.isMissionActive(missionId)) {
          return {
            success: false,
            error: `Mission '${missionId}' is not active`,
          };
        }
      }

      // If objective index is specified
      if (args.length > 1) {
        const parsedIndex = parseInt(args[1]);

        if (isNaN(parsedIndex)) {
          return {
            success: false,
            error: "Objective index must be a number",
          };
        }

        const mission = this.missionManager.getMission(missionId);
        if (!mission) {
          return {
            success: false,
            error: `Mission '${missionId}' not found`,
          };
        }

        if (parsedIndex < 0 || parsedIndex >= mission.objectives.length) {
          return {
            success: false,
            error: `Objective index out of range (0-${
              mission.objectives.length - 1
            })`,
          };
        }

        objectiveIndex = parsedIndex;
      }

      // Get the mission
      const mission = this.missionManager.getMission(missionId);
      if (!mission) {
        return {
          success: false,
          error: `Mission '${missionId}' not found`,
        };
      }

      // Get hint from AI service
      const aiService = AIServiceManager.getCurrentService();
      const context = {
        mission: {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          objectives: mission.objectives,
        },
        currentDirectory: options.currentDirectory,
      };

      const hint = await aiService.generateHint(
        missionId,
        objectiveIndex,
        context
      );

      // Format the output
      const output = [
        `MISSION: ${mission.title}`,
        `OBJECTIVE: ${objectiveIndex + 1}/${mission.objectives.length}`,
        "",
        "HINT:",
        hint,
      ];

      return {
        success: true,
        output: output.join("\n"),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get hint: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
