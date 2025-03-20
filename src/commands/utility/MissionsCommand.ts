import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { MissionManager } from "../../missions/MissionManager";
import { CommandUtils } from "../../utils/CommandUtils";
import chalk from "chalk";
import themeManager from "../../terminal/themes/ThemeManager";
import { MissionRenderer } from "../../missions/MissionRenderer";

/**
 * Missions command to list and interact with available missions
 */
export class MissionsCommand implements Command {
  name = "missions";
  aliases = ["mission"];
  category = CommandCategory.UTILITY;
  description = "View and manage available missions";
  usage = "missions [list|info|start|active] [mission_id]";
  examples = [
    "missions",
    "missions list",
    "missions info mission_001",
    "missions start mission_001",
    "missions active",
  ];
  skillLevel = SkillLevel.INITIATE;
  private missionManager: MissionManager;

  constructor(missionManager: MissionManager) {
    this.missionManager = missionManager;
  }

  async execute(
    args: string[],
    options: CommandOptions
  ): Promise<CommandResult> {
    // Default action
    let action = "list";
    let missionId = "";

    if (args.length > 0) {
      action = args[0];

      if (args.length > 1) {
        missionId = args[1];
      }
    }

    switch (action) {
      case "list":
        return this.listMissions();
      case "info":
        if (!missionId) {
          return {
            success: false,
            error: "Missing mission_id. Usage: missions info <mission_id>",
            output: CommandUtils.error(
              "Missing mission_id. Usage: missions info <mission_id>"
            ),
          };
        }
        return this.getMissionInfo(missionId);
      case "start":
        if (!missionId) {
          return {
            success: false,
            error: "Missing mission_id. Usage: missions start <mission_id>",
            output: CommandUtils.error(
              "Missing mission_id. Usage: missions start <mission_id>"
            ),
          };
        }
        return this.startMission(missionId);
      case "active":
        return this.listActiveMissions();
      default:
        return {
          success: false,
          error: `Unknown action: ${action}. Valid actions are: list, info, start, active`,
          output: CommandUtils.error(
            `Unknown action: ${action}. Valid actions are: list, info, start, active`
          ),
        };
    }
  }

  /**
   * List all available missions
   */
  private listMissions(): CommandResult {
    const allMissions = this.missionManager.getAllMissions();
    const palette = themeManager.getColorPalette();

    if (allMissions.length === 0) {
      return {
        success: true,
        output: CommandUtils.secondary("No missions available."),
      };
    }

    const rows = [
      CommandUtils.primary("Available Missions:"),
      CommandUtils.secondary("==================="),
      "",
    ];

    // Sort by ID
    allMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each mission
    allMissions.forEach((mission) => {
      // Use the MissionRenderer to get a compact representation
      rows.push(MissionRenderer.renderMissionSummary(mission));
      rows.push(`  ${mission.description}`);
      rows.push(``);
    });

    rows.push(
      CommandUtils.accent(
        'To get more information about a mission, type "missions info <mission_id>"'
      )
    );
    rows.push(
      CommandUtils.accent(
        'To start a mission, type "missions start <mission_id>"'
      )
    );

    return {
      success: true,
      output: rows.join("\n"),
    };
  }

  /**
   * Get detailed info about a specific mission
   */
  private getMissionInfo(missionId: string): CommandResult {
    const mission = this.missionManager.getMission(missionId);

    if (!mission) {
      return {
        success: false,
        error: `Mission not found: ${missionId}`,
        output: CommandUtils.error(`Mission not found: ${missionId}`),
      };
    }

    // Use the MissionRenderer to get a detailed representation
    const output = MissionRenderer.renderMission(mission, true);

    return {
      success: true,
      output,
    };
  }

  /**
   * Start a mission
   */
  private startMission(missionId: string): CommandResult {
    const mission = this.missionManager.getMission(missionId);

    if (!mission) {
      return {
        success: false,
        error: `Mission not found: ${missionId}`,
        output: CommandUtils.error(`Mission not found: ${missionId}`),
      };
    }

    if (this.missionManager.isMissionCompleted(missionId)) {
      return {
        success: false,
        error: `Mission ${missionId} is already completed.`,
        output: CommandUtils.error(
          `Mission ${missionId} is already completed.`
        ),
      };
    }

    if (this.missionManager.isMissionActive(missionId)) {
      return {
        success: false,
        error: `Mission ${missionId} is already active.`,
        output: CommandUtils.error(`Mission ${missionId} is already active.`),
      };
    }

    // Start the mission
    const success = this.missionManager.startMission(missionId);

    if (!success) {
      return {
        success: false,
        error: `Failed to start mission: ${missionId}`,
        output: CommandUtils.error(`Failed to start mission: ${missionId}`),
      };
    }

    // Get the mission again to get any dynamic changes applied
    const activeMission = this.missionManager.getMission(missionId);
    if (!activeMission) {
      return {
        success: true,
        output: CommandUtils.accent(`Mission started: ${missionId}`),
      };
    }

    // Use the MissionRenderer to display the mission with ASCII art
    const output = [
      CommandUtils.success("Mission activated:"),
      "",
      MissionRenderer.renderMission(activeMission, true),
      "",
      CommandUtils.primary("Good luck, operative!"),
    ].join("\n");

    return {
      success: true,
      output,
    };
  }

  /**
   * List active missions
   */
  private listActiveMissions(): CommandResult {
    const activeMissions = this.missionManager.getActiveMissions();

    if (activeMissions.length === 0) {
      return {
        success: true,
        output: CommandUtils.secondary(
          'No active missions. Start a mission with "missions start <mission_id>"'
        ),
      };
    }

    const rows = [
      CommandUtils.primary("Active Missions:"),
      CommandUtils.secondary("================"),
      "",
    ];

    // Sort by ID
    activeMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each active mission using the renderer
    activeMissions.forEach((mission) => {
      rows.push(MissionRenderer.renderMissionSummary(mission));
      rows.push(`  ${mission.description}`);
      rows.push(``);
    });

    return {
      success: true,
      output: rows.join("\n"),
    };
  }
}
