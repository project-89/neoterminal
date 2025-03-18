import { SkillProfile } from "../../types";
import {
  AIService,
  AIServiceConfig,
  AIAnalysisRequest,
  AIAnalysisResponse,
} from "./AIService";

/**
 * Abstract base class for AI service implementations
 * Provides common functionality that all providers can use
 */
export abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig | null = null;
  protected initialized: boolean = false;

  /**
   * Initialize the service with configuration
   */
  public async initialize(config: AIServiceConfig): Promise<boolean> {
    this.config = config;
    this.initialized = await this.validateConfig();
    return this.initialized;
  }

  /**
   * Check if service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Analyze a user command and provide feedback
   */
  public abstract analyzeCommand(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse>;

  /**
   * Generate a hint for the current mission objective
   */
  public abstract generateHint(
    missionId: string,
    objectiveIndex: number,
    context: Record<string, any>
  ): Promise<string>;

  /**
   * Generate narrative content
   */
  public abstract generateNarrative(
    context: Record<string, any>
  ): Promise<string>;

  /**
   * Assess user skills
   */
  public abstract assessSkills(
    skillProfile: SkillProfile
  ): Promise<Record<string, number>>;

  /**
   * Validate the configuration
   * To be implemented by each provider
   */
  protected abstract validateConfig(): Promise<boolean>;

  /**
   * Prepare a text prompt with common formatting
   */
  protected preparePrompt(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, any>
  ): string {
    let finalPrompt = systemPrompt + "\n\n";

    // Add context if available
    if (context) {
      finalPrompt += "Context:\n";
      Object.entries(context).forEach(([key, value]) => {
        finalPrompt += `${key}: ${JSON.stringify(value)}\n`;
      });
      finalPrompt += "\n";
    }

    finalPrompt += userPrompt;

    return finalPrompt;
  }

  /**
   * Extract relevant information from a skill profile
   */
  protected formatSkillProfile(profile: SkillProfile): string {
    const commandProficiency = Array.from(profile.commandProficiency.entries())
      .map(([cmd, prof]) => `${cmd}: ${prof.proficiencyScore}/100`)
      .join(", ");

    return `User Skill Level: ${profile.overallLevel}\nCommand Proficiency: ${commandProficiency}`;
  }
}
