import {
  CommandCategory,
  CommandProficiency,
  SkillEvent,
  SkillLevel,
  SkillProfile,
} from "../../types";
import { CommandExecutionContext } from "../core/CommandProcessor";
import EventEmitter from "events";

/**
 * Tracks user command proficiency and skill levels
 */
export class SkillTracker extends EventEmitter {
  private userId: string;
  private skillProfile: SkillProfile;
  private events: SkillEvent[] = [];

  constructor(userId: string) {
    super();
    this.userId = userId;

    // Initialize skill profile
    this.skillProfile = {
      userId,
      overallLevel: SkillLevel.INITIATE,
      categoryLevels: new Map<CommandCategory, number>(),
      commandProficiency: new Map<string, CommandProficiency>(),
      missionsCompleted: [],
      lastUpdated: new Date(),
    };

    // Initialize category levels
    Object.values(CommandCategory).forEach((category) => {
      this.skillProfile.categoryLevels.set(category, 0);
    });
  }

  /**
   * Record a command execution
   */
  public recordCommandExecution(context: CommandExecutionContext): void {
    const event: SkillEvent = {
      command: context.command,
      args: context.args,
      timestamp: context.timestamp,
      executionTime: context.executionTime,
      successful: context.successful,
      errorMessage: context.errorMessage,
    };

    // Store event
    this.events.push(event);

    // Update proficiency
    this.updateProficiency(event);

    // Emit event
    this.emit("skill-event", event);
  }

  /**
   * Update proficiency based on a skill event
   */
  private updateProficiency(event: SkillEvent): void {
    const { command, successful, executionTime } = event;

    // Get or create command proficiency
    let proficiency = this.skillProfile.commandProficiency.get(command);

    if (!proficiency) {
      proficiency = {
        command,
        executionCount: 0,
        successfulExecutions: 0,
        averageExecutionTime: 0,
        lastUsed: new Date(),
        proficiencyScore: 0,
        commonErrors: [],
      };
      this.skillProfile.commandProficiency.set(command, proficiency);
    }

    // Update proficiency
    proficiency.executionCount++;
    proficiency.lastUsed = event.timestamp;

    if (successful) {
      proficiency.successfulExecutions++;
    } else if (event.errorMessage) {
      // Store error if not already in common errors
      if (!proficiency.commonErrors.includes(event.errorMessage)) {
        proficiency.commonErrors.push(event.errorMessage);
      }
    }

    // Update average execution time
    proficiency.averageExecutionTime =
      (proficiency.averageExecutionTime * (proficiency.executionCount - 1) +
        executionTime) /
      proficiency.executionCount;

    // Calculate proficiency score (0-100)
    proficiency.proficiencyScore = this.calculateProficiencyScore(proficiency);

    // Update skill profile
    this.skillProfile.lastUpdated = new Date();
    this.updateSkillLevels();

    // Emit updated event
    this.emit("proficiency-updated", {
      command,
      proficiency: { ...proficiency },
    });
  }

  /**
   * Calculate a proficiency score for a command
   */
  private calculateProficiencyScore(proficiency: CommandProficiency): number {
    const { executionCount, successfulExecutions } = proficiency;

    // Simple score based on success rate and execution count
    const successRate =
      executionCount > 0 ? successfulExecutions / executionCount : 0;

    // Weight more heavily on execution count up to 20 executions
    const executionWeight = Math.min(executionCount / 20, 1);

    return Math.round(successRate * 70 + executionWeight * 30);
  }

  /**
   * Update skill levels based on command proficiency
   */
  private updateSkillLevels(): void {
    // Calculate category levels
    const categoryScores = new Map<
      CommandCategory,
      { total: number; count: number }
    >();

    // Initialize category scores
    Object.values(CommandCategory).forEach((category) => {
      categoryScores.set(category, { total: 0, count: 0 });
    });

    // Calculate scores by category
    this.skillProfile.commandProficiency.forEach((proficiency) => {
      // Skip commands with no executions
      if (proficiency.executionCount === 0) return;

      // Get category for this command (would be provided by command registry in real implementation)
      const category = CommandCategory.NAVIGATION; // Placeholder - need to get actual category

      const categoryScore = categoryScores.get(category);
      if (categoryScore) {
        categoryScore.total += proficiency.proficiencyScore;
        categoryScore.count++;
      }
    });

    // Update category levels
    categoryScores.forEach((score, category) => {
      if (score.count > 0) {
        const averageScore = score.total / score.count;

        // Map score (0-100) to level (0-5)
        let level = 0;
        if (averageScore >= 90) level = 5;
        else if (averageScore >= 75) level = 4;
        else if (averageScore >= 60) level = 3;
        else if (averageScore >= 40) level = 2;
        else if (averageScore >= 20) level = 1;

        this.skillProfile.categoryLevels.set(category, level);
      }
    });

    // Calculate overall level as average of category levels
    let totalLevel = 0;
    let categoryCount = 0;

    this.skillProfile.categoryLevels.forEach((level) => {
      if (level > 0) {
        totalLevel += level;
        categoryCount++;
      }
    });

    if (categoryCount > 0) {
      const averageLevel = Math.round(totalLevel / categoryCount);
      this.skillProfile.overallLevel = averageLevel as SkillLevel;
    }
  }

  /**
   * Get the current skill profile
   */
  public getSkillProfile(): SkillProfile {
    return this.cloneSkillProfile(this.skillProfile);
  }

  /**
   * Create a deep clone of a skill profile
   */
  private cloneSkillProfile(profile: SkillProfile): SkillProfile {
    return {
      userId: profile.userId,
      overallLevel: profile.overallLevel,
      categoryLevels: new Map(profile.categoryLevels),
      commandProficiency: new Map(profile.commandProficiency),
      missionsCompleted: [...profile.missionsCompleted],
      lastUpdated: new Date(profile.lastUpdated),
    };
  }

  /**
   * Record a completed mission
   */
  public recordMissionCompletion(missionId: string): void {
    if (!this.skillProfile.missionsCompleted.includes(missionId)) {
      this.skillProfile.missionsCompleted.push(missionId);
      this.skillProfile.lastUpdated = new Date();

      this.emit("mission-completed", { missionId });
    }
  }
}
