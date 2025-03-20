import { Mission, MissionObjective, SkillLevel } from "../../types";
import { asciiArtRenderer } from "../ascii";
import { CommandUtils } from "../utils/CommandUtils";
import themeManager from "../terminal/themes/ThemeManager";
import chalk from "chalk";
import { MissionStatus } from "./MissionStatus";
import { MissionDifficulty } from "./MissionDifficulty";

/**
 * Class responsible for rendering missions with ASCII art
 */
export class MissionRenderer {
  /**
   * Render a mission with ASCII art
   */
  public static renderMission(mission: Mission, showDetails = true): string {
    const palette = themeManager.getColorPalette();
    const lines: string[] = [];

    // Try to get ASCII art for this mission type
    let missionArt = mission.id.toUpperCase();
    let renderedArt = asciiArtRenderer.render(missionArt, {
      color: palette.accent,
      border: true,
      glitch: Math.random() > 0.7, // Random glitch effect (30% chance)
    });

    // If no specific art found, use the mission's built-in ASCII art
    if (!renderedArt && mission.asciiArt) {
      lines.push(chalk.hex(palette.accent)(mission.asciiArt));
      lines.push("");
    } else if (!renderedArt) {
      // Fallback to generic MISSION art if specific art not found
      renderedArt = asciiArtRenderer.render("MISSION", {
        color: palette.accent,
        border: true,
      });
      if (renderedArt) {
        lines.push(renderedArt.styled);
        lines.push("");
      }
    } else {
      lines.push(renderedArt.styled);
      lines.push("");
    }

    // Mission header
    lines.push(CommandUtils.primary(`// ${mission.title.toUpperCase()} //`));
    lines.push(CommandUtils.secondary("=".repeat(mission.title.length + 6)));
    lines.push("");

    // Mission status with ASCII status indicators
    const status = this.getMissionStatus(mission);
    const statusArt = this.getStatusArt(status);
    if (statusArt) {
      lines.push(statusArt);
      lines.push("");
    }

    // Mission difficulty rating with ASCII indicator
    const difficulty = mission.difficulty as MissionDifficulty;
    lines.push(
      `${CommandUtils.secondary("Difficulty:")} ${this.renderDifficulty(
        difficulty
      )}`
    );

    // Mission details
    if (showDetails) {
      lines.push("");
      lines.push(CommandUtils.secondary("Description:"));
      lines.push(mission.description);

      if (mission.objectives && mission.objectives.length > 0) {
        lines.push("");
        lines.push(CommandUtils.secondary("Objectives:"));
        mission.objectives.forEach((objective, index) => {
          // Create a visual indicator for objectives
          // Since we don't have a 'completed' property, we'll just use symbols
          const objectiveSymbol = chalk.hex(palette.primary)("□");
          lines.push(
            `${objectiveSymbol} ${index + 1}. ${this.getObjectiveDescription(
              objective
            )}`
          );
        });
      }

      if (mission.rewards && mission.rewards.length > 0) {
        lines.push("");
        lines.push(CommandUtils.secondary("Rewards:"));
        mission.rewards.forEach((reward) => {
          let rewardText = "";
          if (reward.type === "skill_points") {
            rewardText = `+${reward.points} ${reward.category} skill points`;
          } else if (reward.type === "story_progression") {
            rewardText = `Story progression: ${reward.nodeId}`;
          } else {
            rewardText = JSON.stringify(reward);
          }
          lines.push(`  ${chalk.hex(palette.success)("•")} ${rewardText}`);
        });
      }

      if (mission.estimatedTime) {
        lines.push("");
        lines.push(
          `${CommandUtils.secondary("Estimated Time:")} ${
            mission.estimatedTime
          } minutes`
        );
      }
    }

    return lines.join("\n");
  }

  /**
   * Render a compact mission summary
   */
  public static renderMissionSummary(mission: Mission): string {
    const palette = themeManager.getColorPalette();
    const status = this.getMissionStatus(mission);
    const statusIcon = this.getStatusIcon(status);
    const difficultyRating = this.renderDifficultyCompact(
      mission.difficulty as MissionDifficulty
    );

    return `${statusIcon} ${CommandUtils.primary(
      mission.title
    )} ${difficultyRating} ${
      mission.estimatedTime
        ? CommandUtils.secondary(`(~${mission.estimatedTime} min)`)
        : ""
    }`;
  }

  /**
   * Get description for a mission objective
   */
  private static getObjectiveDescription(objective: MissionObjective): string {
    if ("description" in objective) {
      return objective.description;
    }

    switch (objective.type) {
      case "execute_command":
        return `Execute command: ${objective.command}${
          objective.args ? " " + objective.args : ""
        }${objective.count ? " (" + objective.count + " times)" : ""}`;
      case "create_file":
        return `Create file: ${objective.path}`;
      case "modify_file":
        return `Modify file: ${objective.path}`;
      case "find_file":
        return `Find file: ${objective.path}`;
      default:
        return `Unknown objective type: ${(objective as any).type}`;
    }
  }

  /**
   * Determine a mission's status based on its properties
   */
  private static getMissionStatus(mission: Mission): MissionStatus {
    // This is a simple implementation - in a real app, you'd use the mission's actual status
    // For now, we'll make a guess based on available information
    const manager = null; // In real usage, you'd pass in the MissionManager instance
    if (manager) {
      if ((manager as any).isMissionCompleted(mission.id)) {
        return MissionStatus.COMPLETED;
      }
      if ((manager as any).isMissionActive(mission.id)) {
        return MissionStatus.ACTIVE;
      }
      if (
        (manager as any).isMissionLocked &&
        (manager as any).isMissionLocked(mission.id)
      ) {
        return MissionStatus.LOCKED;
      }
      return MissionStatus.UNLOCKED;
    }

    // Fallback without mission manager - assume UNLOCKED
    return MissionStatus.UNLOCKED;
  }

  /**
   * Get ASCII art for mission status
   */
  private static getStatusArt(status: MissionStatus): string | null {
    const palette = themeManager.getColorPalette();

    switch (status) {
      case MissionStatus.ACTIVE:
        return (
          asciiArtRenderer.render("MISSION_STATUS_ACTIVE", {
            color: palette.warning,
          })?.styled || null
        );
      case MissionStatus.COMPLETED:
        return (
          asciiArtRenderer.render("MISSION_STATUS_COMPLETE", {
            color: palette.success,
          })?.styled || null
        );
      case MissionStatus.LOCKED:
        return (
          asciiArtRenderer.render("MISSION_STATUS_LOCKED", {
            color: palette.error,
          })?.styled || null
        );
      case MissionStatus.UNLOCKED:
        return (
          asciiArtRenderer.render("MISSION_STATUS_UNLOCKED", {
            color: palette.secondary,
          })?.styled || null
        );
      default:
        return null;
    }
  }

  /**
   * Get status icon for mission
   */
  private static getStatusIcon(status: MissionStatus): string {
    const palette = themeManager.getColorPalette();

    switch (status) {
      case MissionStatus.ACTIVE:
        return chalk.hex(palette.warning)("⟐");
      case MissionStatus.COMPLETED:
        return chalk.hex(palette.success)("✓");
      case MissionStatus.LOCKED:
        return chalk.hex(palette.error)("✕");
      case MissionStatus.UNLOCKED:
        return chalk.hex(palette.secondary)("□");
      default:
        return "■";
    }
  }

  /**
   * Render difficulty rating with ASCII art
   */
  private static renderDifficulty(difficulty: MissionDifficulty): string {
    const palette = themeManager.getColorPalette();
    let difficultyColor: string;
    let difficultyText: string;

    switch (difficulty) {
      case MissionDifficulty.EASY:
        difficultyColor = palette.success;
        difficultyText = "EASY";
        break;
      case MissionDifficulty.MEDIUM:
        difficultyColor = palette.warning;
        difficultyText = "MEDIUM";
        break;
      case MissionDifficulty.HARD:
        difficultyColor = palette.error;
        difficultyText = "HARD";
        break;
      case MissionDifficulty.EXPERT:
        difficultyColor = palette.primary;
        difficultyText = "EXPERT";
        break;
      case MissionDifficulty.MASTER:
        difficultyColor = palette.accent;
        difficultyText = "MASTER";
        break;
      default:
        difficultyColor = palette.secondary;
        difficultyText = "UNKNOWN";
    }

    // Create difficulty bar
    const fullBars = Math.min(5, Math.max(1, difficulty));
    const emptyBars = 5 - fullBars;

    const bars =
      chalk.hex(difficultyColor)("█".repeat(fullBars)) +
      chalk.hex(palette.system)("█".repeat(emptyBars));

    return `${chalk.hex(difficultyColor)(difficultyText)} ${bars}`;
  }

  /**
   * Render compact difficulty rating
   */
  private static renderDifficultyCompact(
    difficulty: MissionDifficulty
  ): string {
    const palette = themeManager.getColorPalette();
    let difficultyColor: string;

    switch (difficulty) {
      case MissionDifficulty.EASY:
        difficultyColor = palette.success;
        break;
      case MissionDifficulty.MEDIUM:
        difficultyColor = palette.warning;
        break;
      case MissionDifficulty.HARD:
        difficultyColor = palette.error;
        break;
      case MissionDifficulty.EXPERT:
        difficultyColor = palette.primary;
        break;
      case MissionDifficulty.MASTER:
        difficultyColor = palette.accent;
        break;
      default:
        difficultyColor = palette.secondary;
    }

    // Create difficulty bar
    const fullBars = Math.min(5, Math.max(1, Math.floor(difficulty)));
    const emptyBars = 5 - fullBars;

    return (
      chalk.hex(difficultyColor)("■".repeat(fullBars)) +
      chalk.hex(palette.system)("□".repeat(emptyBars))
    );
  }
}
