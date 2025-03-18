import { Mission, MissionObjective, SkillLevel } from "../../types";
import { VirtualFileSystem } from "../filesystem/VirtualFileSystem";
import { SkillTracker } from "../skills/SkillTracker";
import EventEmitter from "events";

/**
 * Manages missions and tracks their progress
 */
export class MissionManager extends EventEmitter {
  private missions: Map<string, Mission> = new Map();
  private activeMissions: Set<string> = new Set();
  private completedMissions: Set<string> = new Set();
  private filesystem: VirtualFileSystem;
  private skillTracker?: SkillTracker;
  private difficultyModifiers: Map<string, number> = new Map();

  constructor(filesystem: VirtualFileSystem, skillTracker?: SkillTracker) {
    super();
    this.filesystem = filesystem;
    this.skillTracker = skillTracker;
  }

  /**
   * Register a mission
   */
  public registerMission(mission: Mission): void {
    this.missions.set(mission.id, mission);
  }

  /**
   * Get a mission by ID
   */
  public getMission(id: string): Mission | undefined {
    const mission = this.missions.get(id);

    if (mission && this.skillTracker) {
      // Create a copy with dynamic difficulty adjustments if needed
      return this.applyDynamicDifficulty(mission);
    }

    return mission;
  }

  /**
   * Get all available missions
   */
  public getAllMissions(): Mission[] {
    if (this.skillTracker) {
      // Apply dynamic difficulty to all missions
      return Array.from(this.missions.values()).map((mission) =>
        this.applyDynamicDifficulty(mission)
      );
    }

    return Array.from(this.missions.values());
  }

  /**
   * Get all active missions
   */
  public getActiveMissions(): Mission[] {
    return Array.from(this.activeMissions)
      .map((id) => this.getMission(id))
      .filter((mission): mission is Mission => !!mission);
  }

  /**
   * Get all completed missions
   */
  public getCompletedMissions(): Mission[] {
    return Array.from(this.completedMissions)
      .map((id) => this.getMission(id))
      .filter((mission): mission is Mission => !!mission);
  }

  /**
   * Start a mission
   */
  public startMission(id: string): boolean {
    const mission = this.getMission(id);

    if (!mission) {
      return false;
    }

    // Check if user meets the skill requirements
    if (this.skillTracker) {
      const userSkillProfile = this.skillTracker.getSkillProfile();

      if (userSkillProfile.overallLevel < mission.requiredSkillLevel) {
        this.emit("mission-requirements-not-met", {
          missionId: id,
          mission,
          requiredLevel: mission.requiredSkillLevel,
          userLevel: userSkillProfile.overallLevel,
        });
        return false;
      }
    }

    this.activeMissions.add(id);

    // Calculate initial difficulty modifier for this mission
    this.calculateDifficultyModifier(id);

    const dynamicMission = this.getMission(id);
    this.emit("mission-started", { missionId: id, mission: dynamicMission });

    return true;
  }

  /**
   * Complete a mission
   */
  public completeMission(id: string): boolean {
    const mission = this.getMission(id);

    if (!mission || !this.activeMissions.has(id)) {
      return false;
    }

    this.activeMissions.delete(id);
    this.completedMissions.add(id);

    this.emit("mission-completed", { missionId: id, mission });

    // Unlock next missions if specified
    if (mission.nextMissions) {
      mission.nextMissions.forEach((nextMissionId) => {
        this.emit("mission-unlocked", { missionId: nextMissionId });
      });
    }

    return true;
  }

  /**
   * Check if a mission is completed
   */
  public isMissionCompleted(id: string): boolean {
    return this.completedMissions.has(id);
  }

  /**
   * Check if a mission is active
   */
  public isMissionActive(id: string): boolean {
    return this.activeMissions.has(id);
  }

  /**
   * Set the difficulty modifier for a mission
   * Values < 1.0 make the mission easier, values > 1.0 make it harder
   */
  public setDifficultyModifier(missionId: string, modifier: number): void {
    this.difficultyModifiers.set(missionId, modifier);
  }

  /**
   * Get the current difficulty modifier for a mission
   */
  public getDifficultyModifier(missionId: string): number {
    return this.difficultyModifiers.get(missionId) || 1.0;
  }

  /**
   * Calculate a dynamic difficulty modifier based on user skill
   */
  public calculateDifficultyModifier(missionId: string): void {
    if (!this.skillTracker) return;

    const mission = this.missions.get(missionId);
    if (!mission) return;

    const userProfile = this.skillTracker.getSkillProfile();
    let modifier = 1.0;

    // Base difficulty on the gap between user's level and mission's required level
    const levelGap = userProfile.overallLevel - mission.requiredSkillLevel;

    if (levelGap <= -2) {
      // User is significantly under-leveled, make it easier
      modifier = 0.7;
    } else if (levelGap <= -1) {
      // User is slightly under-leveled, make it a bit easier
      modifier = 0.85;
    } else if (levelGap >= 2) {
      // User is significantly over-leveled, make it harder
      modifier = 1.3;
    } else if (levelGap >= 1) {
      // User is slightly over-leveled, make it a bit harder
      modifier = 1.15;
    }

    // Adjust based on command proficiency related to this mission
    if (mission.requiredCommands.length > 0) {
      let totalProficiency = 0;
      let relevantCommands = 0;

      mission.requiredCommands.forEach((cmd) => {
        const proficiency = userProfile.commandProficiency.get(cmd);
        if (proficiency) {
          totalProficiency += proficiency.proficiencyScore;
          relevantCommands++;
        }
      });

      if (relevantCommands > 0) {
        const avgProficiency = totalProficiency / relevantCommands;

        // Adjust modifier based on command proficiency
        if (avgProficiency > 80) {
          modifier *= 1.2; // More difficult for highly proficient users
        } else if (avgProficiency < 30) {
          modifier *= 0.8; // Easier for less proficient users
        }
      }
    }

    // Save the calculated modifier
    this.difficultyModifiers.set(missionId, modifier);
  }

  /**
   * Apply dynamic difficulty to a mission
   */
  private applyDynamicDifficulty(originalMission: Mission): Mission {
    const modifier = this.getDifficultyModifier(originalMission.id);

    // If no modifier or default modifier, return the original mission
    if (!modifier || modifier === 1.0) {
      return originalMission;
    }

    // Create a modified copy of the mission
    const modifiedMission: Mission = {
      ...originalMission,

      // Adjust difficulty level based on modifier
      difficulty: Math.max(
        1,
        Math.min(5, Math.round(originalMission.difficulty * modifier))
      ),

      // Adjust estimated time based on modifier
      estimatedTime: Math.round(originalMission.estimatedTime * (1 / modifier)),

      // Clone objectives so we don't modify the original
      objectives: [...originalMission.objectives],
    };

    // Dynamically adjust objectives based on difficulty
    modifiedMission.objectives = originalMission.objectives.map((objective) => {
      if ("count" in objective && objective.count) {
        // Adjust count requirements based on modifier
        return {
          ...objective,
          count: Math.max(1, Math.round(objective.count * modifier)),
        };
      }
      return objective;
    });

    return modifiedMission;
  }
}
