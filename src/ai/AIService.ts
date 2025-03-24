import { SkillProfile } from "../../types";

/**
 * Configuration options for AI services
 */
export interface AIServiceConfig {
  provider: string;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  extraParams?: Record<string, any>;
}

/**
 * Message format for conversation history
 */
export interface ConversationMessage {
  role: string; // "system", "user", "assistant"
  content: string;
}

/**
 * Request for AI analysis
 */
export interface AIAnalysisRequest {
  userInput: string;
  commandHistory: string[];
  skillProfile: SkillProfile;
  context?: Record<string, any>;
}

/**
 * Response from AI analysis
 */
export interface AIAnalysisResponse {
  suggestion?: string;
  feedback?: string;
  skillAssessment?: {
    commandProficiency?: number;
    recommendedCommands?: string[];
    suggestedNextSteps?: string[];
  };
  error?: string;
}

/**
 * Interface for AI service providers
 */
export interface AIService {
  /**
   * Initialize the AI service with configuration
   */
  initialize(config: AIServiceConfig): Promise<boolean>;

  /**
   * Check if the service is properly initialized
   */
  isInitialized(): boolean;

  /**
   * Generate a response from conversation history
   * @param messages Array of conversation messages with roles and content
   * @returns Generated response text
   */
  generateResponse(messages: ConversationMessage[]): Promise<string>;

  /**
   * Analyze user command and provide feedback/suggestions
   */
  analyzeCommand(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;

  /**
   * Generate a hint for the current mission objective
   */
  generateHint(
    missionId: string,
    objectiveIndex: number,
    context: Record<string, any>
  ): Promise<string>;

  /**
   * Generate narrative content based on user progress
   */
  generateNarrative(context: Record<string, any>): Promise<string>;

  /**
   * Assess user skill level based on command history
   */
  assessSkills(skillProfile: SkillProfile): Promise<Record<string, number>>;
}
