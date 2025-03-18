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
    ];

    // Sort by ID
    allMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each mission
    allMissions.forEach((mission) => {
      const isCompleted = this.missionManager.isMissionCompleted(mission.id);
      const isActive = this.missionManager.isMissionActive(mission.id);

      let statusText;
      if (isCompleted) {
        statusText = CommandUtils.success("[COMPLETED]");
      } else if (isActive) {
        statusText = CommandUtils.accent("[ACTIVE]");
      } else {
        statusText = CommandUtils.secondary("[AVAILABLE]");
      }

      const missionTitle = chalk.hex(palette.primary)(
        `${mission.id}: ${mission.title}`
      );
      rows.push(`${missionTitle} ${statusText}`);

      // Difficulty with colored stars
      const difficultyStars = "★".repeat(mission.difficulty);
      rows.push(
        `  ${CommandUtils.secondary("Difficulty:")} ${CommandUtils.warning(
          difficultyStars
        )}`
      );

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
    const palette = themeManager.getColorPalette();

    if (!mission) {
      return {
        success: false,
        error: `Mission not found: ${missionId}`,
        output: CommandUtils.error(`Mission not found: ${missionId}`),
      };
    }

    let statusText;
    if (this.missionManager.isMissionCompleted(mission.id)) {
      statusText = CommandUtils.success("COMPLETED");
    } else if (this.missionManager.isMissionActive(mission.id)) {
      statusText = CommandUtils.accent("ACTIVE");
    } else {
      statusText = CommandUtils.secondary("AVAILABLE");
    }

    const difficultyStars = CommandUtils.warning(
      "★".repeat(mission.difficulty)
    );

    const rows = [
      mission.asciiArt ? chalk.hex(palette.accent)(mission.asciiArt) : "",
      CommandUtils.primary(`Mission: ${mission.title} (${mission.id})`),
      `${CommandUtils.secondary("Status:")} ${statusText}`,
      `${CommandUtils.secondary("Difficulty:")} ${difficultyStars}`,
      `${CommandUtils.secondary("Estimated Time:")} ${
        mission.estimatedTime
      } minutes`,
      "",
      CommandUtils.primary("Description:"),
      mission.description,
      "",
      CommandUtils.primary("Briefing:"),
      mission.briefing,
      "",
      CommandUtils.primary("Objectives:"),
    ];

    // Format objectives
    mission.objectives.forEach((objective, index) => {
      const objectiveNumber = CommandUtils.accent(`${index + 1}.`);
      let objectiveText = "";

      if (objective.type === "execute_command") {
        objectiveText = `Execute command: ${CommandUtils.secondary(
          objective.command
        )}${objective.args ? " " + objective.args : ""}${
          objective.count ? " (" + objective.count + " times)" : ""
        }`;
      } else if (objective.type === "create_file") {
        objectiveText = `Create file: ${CommandUtils.secondary(
          objective.path
        )}`;
      } else if (objective.type === "modify_file") {
        objectiveText = `Modify file: ${CommandUtils.secondary(
          objective.path
        )}`;
      } else if (objective.type === "find_file") {
        objectiveText = `Find file: ${CommandUtils.secondary(objective.path)}`;
      } else if (objective.type === "custom") {
        objectiveText = objective.description;
      }

      rows.push(`  ${objectiveNumber} ${objectiveText}`);
    });

    rows.push("");
    rows.push(
      CommandUtils.accent(
        'To start this mission, type "missions start ' + mission.id + '"'
      )
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
    const palette = themeManager.getColorPalette();

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

    // Show mission briefing
    const rows = [
      mission.asciiArt ? chalk.hex(palette.accent)(mission.asciiArt) : "",
      CommandUtils.primary(`Mission: ${mission.title}`),
      `${CommandUtils.secondary("Status:")} ${CommandUtils.accent("ACTIVE")}`,
      "",
      CommandUtils.primary("Briefing:"),
      mission.briefing,
      "",
      CommandUtils.primary("Objectives:"),
    ];

    // Format objectives
    mission.objectives.forEach((objective, index) => {
      const objectiveNumber = CommandUtils.accent(`${index + 1}.`);
      let objectiveText = "";

      if (objective.type === "execute_command") {
        objectiveText = `Execute command: ${CommandUtils.secondary(
          objective.command
        )}${objective.args ? " " + objective.args : ""}${
          objective.count ? " (" + objective.count + " times)" : ""
        }`;
      } else if (objective.type === "create_file") {
        objectiveText = `Create file: ${CommandUtils.secondary(
          objective.path
        )}`;
      } else if (objective.type === "modify_file") {
        objectiveText = `Modify file: ${CommandUtils.secondary(
          objective.path
        )}`;
      } else if (objective.type === "find_file") {
        objectiveText = `Find file: ${CommandUtils.secondary(objective.path)}`;
      } else if (objective.type === "custom") {
        objectiveText = objective.description;
      }

      rows.push(`  ${objectiveNumber} ${objectiveText}`);
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
    const palette = themeManager.getColorPalette();

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
    ];

    // Sort by ID
    activeMissions.sort((a, b) => a.id.localeCompare(b.id));

    // Format each mission
    activeMissions.forEach((mission) => {
      const missionTitle = chalk.hex(palette.primary)(
        `${mission.id}: ${mission.title}`
      );
      rows.push(missionTitle);

      // Difficulty with colored stars
      const difficultyStars = "★".repeat(mission.difficulty);
      rows.push(
        `  ${CommandUtils.secondary("Difficulty:")} ${CommandUtils.warning(
          difficultyStars
        )}`
      );

      rows.push(`  ${mission.description}`);
      rows.push(``);
    });

    return {
      success: true,
      output: rows.join("\n"),
    };
  }
}
