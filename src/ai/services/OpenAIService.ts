import {
  AIService,
  AIServiceConfig,
  AIAnalysisRequest,
  AIAnalysisResponse,
  ConversationMessage,
} from "../AIService";
import { SkillProfile } from "../../../types";

/**
 * OpenAI service implementation
 */
export class OpenAIService implements AIService {
  private apiKey: string | null = null;
  private endpoint: string = "https://api.openai.com/v1/chat/completions";
  private model: string = "gpt-3.5-turbo";
  private temperature: number = 0.7;
  private maxTokens: number = 1000;
  private initialized: boolean = false;

  /**
   * Initialize the OpenAI service
   */
  public async initialize(config: AIServiceConfig): Promise<boolean> {
    // Check for required configuration
    if (!config.apiKey) {
      console.error("[OpenAIService] API key is required");
      return false;
    }

    this.apiKey = config.apiKey;

    // Set optional parameters if provided
    if (config.endpoint) {
      this.endpoint = config.endpoint;
    }

    if (config.model) {
      this.model = config.model;
    }

    if (config.temperature !== undefined) {
      this.temperature = config.temperature;
    }

    if (config.maxTokens !== undefined) {
      this.maxTokens = config.maxTokens;
    }

    this.initialized = true;
    console.log(`[OpenAIService] Initialized with model: ${this.model}`);
    return true;
  }

  /**
   * Check if service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a response based on conversation history
   */
  public async generateResponse(
    messages: ConversationMessage[]
  ): Promise<string> {
    this.ensureInitialized();

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[OpenAIService] API error:", errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response from OpenAI API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("[OpenAIService] Error generating response:", error);
      return "I'm sorry, I encountered an error processing your request.";
    }
  }

  /**
   * Analyze user command with OpenAI
   */
  public async analyzeCommand(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    this.ensureInitialized();

    // Create prompt for command analysis
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for a CLI learning adventure game. Analyze the user's command and provide helpful feedback.
        The user has the following skill profile: ${JSON.stringify(
          request.skillProfile
        )}
        Recent command history: ${request.commandHistory.join(", ")}`,
      },
      {
        role: "user",
        content: `Analyze this command: ${request.userInput}`,
      },
    ];

    try {
      const response = await this.generateResponse(messages);

      // Parse the response
      return {
        feedback: response,
        // Basic processing of the response could be added here
      };
    } catch (error) {
      console.error("[OpenAIService] Error analyzing command:", error);
      return {
        error: "Failed to analyze command",
      };
    }
  }

  /**
   * Generate hint for current mission objective
   */
  public async generateHint(
    missionId: string,
    objectiveIndex: number,
    context: Record<string, any>
  ): Promise<string> {
    this.ensureInitialized();

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant in a CLI learning adventure game. Provide a hint for the current mission objective.",
      },
      {
        role: "user",
        content: `I need a hint for mission ${missionId}, objective #${objectiveIndex}. Context: ${JSON.stringify(
          context
        )}`,
      },
    ];

    try {
      return await this.generateResponse(messages);
    } catch (error) {
      console.error("[OpenAIService] Error generating hint:", error);
      return "I'm sorry, I couldn't generate a hint at this time.";
    }
  }

  /**
   * Generate narrative content
   */
  public async generateNarrative(
    context: Record<string, any>
  ): Promise<string> {
    this.ensureInitialized();

    const messages = [
      {
        role: "system",
        content:
          "You are the narrator in a cyberpunk CLI learning adventure game. Generate engaging narrative content.",
      },
      {
        role: "user",
        content: `Generate narrative content with this context: ${JSON.stringify(
          context
        )}`,
      },
    ];

    try {
      return await this.generateResponse(messages);
    } catch (error) {
      console.error("[OpenAIService] Error generating narrative:", error);
      return "The system flickers momentarily, but the connection stabilizes.";
    }
  }

  /**
   * Assess user skills based on command history
   */
  public async assessSkills(
    skillProfile: SkillProfile
  ): Promise<Record<string, number>> {
    this.ensureInitialized();

    // This could be expanded to use the LLM for more sophisticated skill assessment
    return {};
  }

  /**
   * Ensure the service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("OpenAI service is not initialized");
    }
  }
}
