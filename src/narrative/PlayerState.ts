/**
 * Player state interface
 */
export interface PlayerStateData {
  hackingSkill: number;
  reputation: number;
  corporateAlert: number;
  factionStanding: Map<string, number>;
  inventory: string[];
  discoveredLocations: string[];
  completedMissions: string[];
  knownCharacters: string[];
  unlockedSkills: string[];
  flags: Set<string>;
  storyVariables: Map<string, string | number | boolean>;
}

/**
 * Manages the player's state in the narrative system
 */
export class PlayerState {
  public hackingSkill: number = 1;
  public reputation: number = 0;
  public corporateAlert: number = 0;
  public factionStanding: Map<string, number> = new Map();
  public inventory: string[] = [];
  public discoveredLocations: string[] = [];
  public completedMissions: string[] = [];
  public knownCharacters: string[] = [];
  public unlockedSkills: string[] = [];
  public flags: Set<string> = new Set();
  public storyVariables: Map<string, string | number | boolean> = new Map();

  constructor() {}

  /**
   * Initialize the player state with data
   */
  public initialize(data: PlayerStateData): void {
    this.hackingSkill = data.hackingSkill || 1;
    this.reputation = data.reputation || 0;
    this.corporateAlert = data.corporateAlert || 0;
    this.factionStanding = new Map(data.factionStanding || []);
    this.inventory = [...(data.inventory || [])];
    this.discoveredLocations = [...(data.discoveredLocations || [])];
    this.completedMissions = [...(data.completedMissions || [])];
    this.knownCharacters = [...(data.knownCharacters || [])];
    this.unlockedSkills = [...(data.unlockedSkills || [])];
    this.flags = new Set(data.flags || []);
    this.storyVariables = new Map(data.storyVariables || []);
  }

  /**
   * Get a serializable version of the state
   */
  public getState(): any {
    return {
      hackingSkill: this.hackingSkill,
      reputation: this.reputation,
      corporateAlert: this.corporateAlert,
      factionStanding: Array.from(this.factionStanding.entries()),
      inventory: this.inventory,
      discoveredLocations: this.discoveredLocations,
      completedMissions: this.completedMissions,
      knownCharacters: this.knownCharacters,
      unlockedSkills: this.unlockedSkills,
      flags: Array.from(this.flags),
      storyVariables: Array.from(this.storyVariables.entries()),
    };
  }

  /**
   * Load state from saved data
   */
  public loadState(state: any): void {
    if (!state) return;

    this.hackingSkill = state.hackingSkill || this.hackingSkill;
    this.reputation = state.reputation || this.reputation;
    this.corporateAlert = state.corporateAlert || this.corporateAlert;

    if (state.factionStanding) {
      this.factionStanding = new Map(state.factionStanding);
    }

    this.inventory = state.inventory || this.inventory;
    this.discoveredLocations =
      state.discoveredLocations || this.discoveredLocations;
    this.completedMissions = state.completedMissions || this.completedMissions;
    this.knownCharacters = state.knownCharacters || this.knownCharacters;
    this.unlockedSkills = state.unlockedSkills || this.unlockedSkills;

    if (state.flags) {
      this.flags = new Set(state.flags);
    }

    if (state.storyVariables) {
      this.storyVariables = new Map(state.storyVariables);
    }
  }

  /**
   * Modify a stat value
   */
  public modifyStat(stat: string, value: number): void {
    switch (stat) {
      case "hackingSkill":
        this.hackingSkill = Math.max(1, this.hackingSkill + value);
        break;
      case "reputation":
        this.reputation += value;
        break;
      case "corporateAlert":
        this.corporateAlert = Math.max(
          0,
          Math.min(100, this.corporateAlert + value)
        );
        break;
    }
  }

  /**
   * Add an item to inventory
   */
  public addInventoryItem(item: string): void {
    if (!this.inventory.includes(item)) {
      this.inventory.push(item);
    }
  }

  /**
   * Remove an item from inventory
   */
  public removeInventoryItem(item: string): void {
    const index = this.inventory.indexOf(item);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  /**
   * Add a discovered location
   */
  public addDiscoveredLocation(location: string): void {
    if (!this.discoveredLocations.includes(location)) {
      this.discoveredLocations.push(location);
    }
  }

  /**
   * Complete a mission
   */
  public completeMission(missionId: string): void {
    if (!this.completedMissions.includes(missionId)) {
      this.completedMissions.push(missionId);
    }
  }

  /**
   * Unlock a skill
   */
  public unlockSkill(skill: string): void {
    if (!this.unlockedSkills.includes(skill)) {
      this.unlockedSkills.push(skill);
    }
  }

  /**
   * Set a flag in the player state
   */
  public setFlag(flag: string): void {
    this.flags.add(flag);
  }

  /**
   * Clear a flag from the player state
   */
  public clearFlag(flag: string): void {
    this.flags.delete(flag);
  }

  /**
   * Check if a flag is set
   */
  public hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  /**
   * Modify faction standing
   */
  public modifyFactionStanding(faction: string, value: number): void {
    const currentValue = this.factionStanding.get(faction) || 0;
    this.factionStanding.set(faction, currentValue + value);
  }

  /**
   * Set a story variable
   */
  public setStoryVariable(key: string, value: string | number | boolean): void {
    this.storyVariables.set(key, value);
  }

  /**
   * Get a story variable
   */
  public getStoryVariable(key: string): string | number | boolean | undefined {
    return this.storyVariables.get(key);
  }
}
