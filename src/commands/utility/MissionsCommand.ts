import {
  Command,
  CommandCategory,
  CommandOptions,
  CommandResult,
  SkillLevel,
} from "../../../types";
import { MissionManager } from "../../missions/MissionManager";

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
          };
        }
        return this.getMissionInfo(missionId);
      case "start":
        if (!missionId) {
          return {
            success: false,
            error: "Missing mission_id. Usage: missions start <mission_id>",
          };
        }
        return this.startMission(missionId);
      case "active":
        return this.listActiveMissions();
      default:
        return {
          success: false,
          error: `Unknown action: ${action}. Valid actions are: list, info, start, active`,
        };
    }
  }

  /**
   * List all available missions
   */
  private listMissions(): CommandResult {
    const allMissions = this.missionManager.getAllMissions();

    if (allMissions.length === 0) {
      return {
        success: true,
        output: "No missions available.",
      };
    }

    const rows = ["Available Missions:", "==================="];

    // Sort by ID
    allMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each mission
    allMissions.forEach((mission) => {
      const status = this.missionManager.isMissionCompleted(mission.id)
        ? "[COMPLETED]"
        : this.missionManager.isMissionActive(mission.id)
        ? "[ACTIVE]"
        : "[AVAILABLE]";

      rows.push(`${mission.id}: ${mission.title} ${status}`);
      rows.push(`  Difficulty: ${"★".repeat(mission.difficulty)}`);
      rows.push(`  ${mission.description}`);
      rows.push(``);
    });

    rows.push(
      'To get more information about a mission, type "missions info <mission_id>"'
    );
    rows.push('To start a mission, type "missions start <mission_id>"');

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
      };
    }

    const rows = [
      mission.asciiArt || "",
      `Mission: ${mission.title} (${mission.id})`,
      `Status: ${
        this.missionManager.isMissionCompleted(mission.id)
          ? "COMPLETED"
          : this.missionManager.isMissionActive(mission.id)
          ? "ACTIVE"
          : "AVAILABLE"
      }`,
      `Difficulty: ${"★".repeat(mission.difficulty)}`,
      `Estimated Time: ${mission.estimatedTime} minutes`,
      "",
      "Description:",
      mission.description,
      "",
      "Briefing:",
      mission.briefing,
      "",
      "Objectives:",
    ];

    // Format objectives
    mission.objectives.forEach((objective, index) => {
      if (objective.type === "execute_command") {
        rows.push(
          `  ${index + 1}. Execute command: ${objective.command}${
            objective.args ? " " + objective.args : ""
          }${objective.count ? " (" + objective.count + " times)" : ""}`
        );
      } else if (objective.type === "create_file") {
        rows.push(`  ${index + 1}. Create file: ${objective.path}`);
      } else if (objective.type === "modify_file") {
        rows.push(`  ${index + 1}. Modify file: ${objective.path}`);
      } else if (objective.type === "find_file") {
        rows.push(`  ${index + 1}. Find file: ${objective.path}`);
      } else if (objective.type === "custom") {
        rows.push(`  ${index + 1}. ${objective.description}`);
      }
    });

    rows.push("");
    rows.push(
      'To start this mission, type "missions start ' + mission.id + '"'
    );

    return {
      success: true,
      output: rows.join("\n"),
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
      };
    }

    if (this.missionManager.isMissionCompleted(missionId)) {
      return {
        success: false,
        error: `Mission ${missionId} is already completed.`,
      };
    }

    if (this.missionManager.isMissionActive(missionId)) {
      return {
        success: false,
        error: `Mission ${missionId} is already active.`,
      };
    }

    // Start the mission
    const success = this.missionManager.startMission(missionId);

    if (!success) {
      return {
        success: false,
        error: `Failed to start mission: ${missionId}`,
      };
    }

    // Show mission briefing
    const rows = [
      mission.asciiArt || "",
      `Mission: ${mission.title}`,
      `Status: ACTIVE`,
      "",
      "Briefing:",
      mission.briefing,
      "",
      "Objectives:",
    ];

    // Format objectives
    mission.objectives.forEach((objective, index) => {
      if (objective.type === "execute_command") {
        rows.push(
          `  ${index + 1}. Execute command: ${objective.command}${
            objective.args ? " " + objective.args : ""
          }${objective.count ? " (" + objective.count + " times)" : ""}`
        );
      } else if (objective.type === "create_file") {
        rows.push(`  ${index + 1}. Create file: ${objective.path}`);
      } else if (objective.type === "modify_file") {
        rows.push(`  ${index + 1}. Modify file: ${objective.path}`);
      } else if (objective.type === "find_file") {
        rows.push(`  ${index + 1}. Find file: ${objective.path}`);
      } else if (objective.type === "custom") {
        rows.push(`  ${index + 1}. ${objective.description}`);
      }
    });

    return {
      success: true,
      output: rows.join("\n"),
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
        output:
          'No active missions. Start a mission with "missions start <mission_id>"',
      };
    }

    const rows = ["Active Missions:", "================"];

    // Sort by ID
    activeMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each mission
    activeMissions.forEach((mission) => {
      rows.push(`${mission.id}: ${mission.title}`);
      rows.push(`  Difficulty: ${"★".repeat(mission.difficulty)}`);
      rows.push(`  ${mission.description}`);
      rows.push(``);
    });

    return {
      success: true,
      output: rows.join("\n"),
    };
  }
}
