import { Mission, MissionObjective, SkillLevel } from "../../types";
import { VirtualFileSystem } from "../filesystem/VirtualFileSystem";
import EventEmitter from "events";

/**
 * Manages missions and tracks their progress
 */
export class MissionManager extends EventEmitter {
  private missions: Map<string, Mission> = new Map();
  private activeMissions: Set<string> = new Set();
  private completedMissions: Set<string> = new Set();
  private filesystem: VirtualFileSystem;

  constructor(filesystem: VirtualFileSystem) {
    super();
    this.filesystem = filesystem;
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
    return this.missions.get(id);
  }

  /**
   * Get all available missions
   */
  public getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  /**
   * Get all active missions
   */
  public getActiveMissions(): Mission[] {
    return Array.from(this.activeMissions)
      .map((id) => this.missions.get(id))
      .filter((mission): mission is Mission => !!mission);
  }

  /**
   * Get all completed missions
   */
  public getCompletedMissions(): Mission[] {
    return Array.from(this.completedMissions)
      .map((id) => this.missions.get(id))
      .filter((mission): mission is Mission => !!mission);
  }

  /**
   * Start a mission
   */
  public startMission(id: string): boolean {
    const mission = this.missions.get(id);

    if (!mission) {
      return false;
    }

    this.activeMissions.add(id);
    this.emit("mission-started", { missionId: id, mission });

    return true;
  }

  /**
   * Complete a mission
   */
  public completeMission(id: string): boolean {
    const mission = this.missions.get(id);

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
}
