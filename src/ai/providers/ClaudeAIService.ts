import { SkillProfile } from "../../../types";
import { AIAnalysisRequest, AIAnalysisResponse } from "../AIService";
import { BaseAIService } from "../BaseAIService";
import axios from "axios";

/**
 * Anthropic Claude AI service implementation
 */
export class ClaudeAIService extends BaseAIService {
  /**
   * Analyze a user command
   */
  public async analyzeCommand(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      if (!this.isInitialized()) {
        throw new Error("Claude AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL. 
Your role is to analyze user commands and provide feedback that helps them learn terminal commands.
Be concise, informative, and maintain the cyberpunk aesthetic in your responses.`;

      const userPrompt = `User input: ${request.userInput}
Recent command history: ${request.commandHistory.slice(-5).join(", ")}
${this.formatSkillProfile(request.skillProfile)}`;

      // Make API call to Claude
      const response = await this.callClaudeAPI(
        systemPrompt,
        userPrompt,
        request.context
      );

      // Extract relevant content from Claude's response
      return {
        suggestion: response.suggestion,
        feedback: response.feedback,
        skillAssessment: response.skillAssessment,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error with Claude API",
      };
    }
  }

  /**
   * Generate a hint for the current mission objective
   */
  public async generateHint(
    missionId: string,
    objectiveIndex: number,
    context: Record<string, any>
  ): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error("Claude AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to provide hints for mission objectives that help users learn terminal commands without giving away the entire solution.
Be concise, informative, and maintain the cyberpunk aesthetic in your responses.`;

      const userPrompt = `The user is on mission ${missionId} and is stuck on objective ${
        objectiveIndex + 1
      }.
Please provide a hint that guides them without revealing the complete solution.`;

      const response = await this.callClaudeAPI(
        systemPrompt,
        userPrompt,
        context
      );
      return response.suggestion || "No hint available at this time.";
    } catch (error) {
      return `Error generating hint: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  /**
   * Generate narrative content
   */
  public async generateNarrative(
    context: Record<string, any>
  ): Promise<string> {
    try {
      if (!this.isInitialized()) {
        throw new Error("Claude AI service not initialized");
      }

      const systemPrompt = `You are an AI storyteller in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to generate engaging narrative content that fits the cyberpunk theme and responds to the user's progress.
Create atmospheric, immersive text that enhances the hacker simulation experience.`;

      const userPrompt = `Generate a brief narrative segment based on the user's current context and progress.
Keep it concise but impactful, focusing on cyberpunk themes of technology, control, and resistance.`;

      const response = await this.callClaudeAPI(
        systemPrompt,
        userPrompt,
        context
      );
      return response.suggestion || "Narrative generation unavailable.";
    } catch (error) {
      return `Error generating narrative: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  /**
   * Assess user skills
   */
  public async assessSkills(
    skillProfile: SkillProfile
  ): Promise<Record<string, number>> {
    try {
      if (!this.isInitialized()) {
        throw new Error("Claude AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to analyze a user's skill profile and provide an assessment of their command proficiency.
Focus on identifying strengths, weaknesses, and opportunities for improvement.`;

      const userPrompt = `Please analyze this user's skill profile and provide an assessment of their command proficiency:
${this.formatSkillProfile(skillProfile)}`;

      const response = await this.callClaudeAPI(systemPrompt, userPrompt);

      // If we have a real assessment from the API, use it
      if (
        response.skillAssessment &&
        response.skillAssessment.commandProficiency
      ) {
        return response.skillAssessment.commandProficiency;
      }

      // Fallback to basic assessment
      const assessments: Record<string, number> = {};
      skillProfile.commandProficiency.forEach((proficiency, command) => {
        assessments[command] = proficiency.proficiencyScore;
      });

      return assessments;
    } catch (error) {
      console.error("Error assessing skills:", error);
      return {};
    }
  }

  /**
   * Validate the configuration
   */
  protected async validateConfig(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    // Check for required configuration
    if (!this.config.apiKey) {
      console.error("Claude AI service requires an API key");
      return false;
    }

    if (!this.config.model) {
      // Set default model if not specified
      this.config.model = "claude-3-sonnet-20240229";
    }

    if (!this.config.endpoint) {
      // Set default endpoint if not specified
      this.config.endpoint = "https://api.anthropic.com/v1/messages";
    }

    return true;
  }

  /**
   * Call the Claude API using Axios
   */
  private async callClaudeAPI(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, any>
  ): Promise<any> {
    if (!this.config?.apiKey) {
      throw new Error("API key not configured for Claude");
    }

    const prompt = this.preparePrompt(systemPrompt, userPrompt, context);
    const endpoint = this.config.endpoint!;
    const model = this.config.model!;
    const maxTokens = this.config.maxTokens || 500;
    const temperature = this.config.temperature || 0.7;

    try {
      // Log API call without sensitive information
      console.log(`[Claude API] Calling ${model} with ${prompt.length} chars`);

      // Make API call to Anthropic Claude
      const response = await axios.post(
        endpoint,
        {
          model: model,
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      // Parse response
      if (response.data && response.data.content) {
        // Extract text from Claude's response
        const text = response.data.content[0]?.text || "";

        // For simplicity, we'll return a basic structure that our system expects
        // In a more sophisticated implementation, you could parse this text to extract structured data
        return {
          suggestion: text,
          feedback: "",
          skillAssessment: {
            commandProficiency: {},
          },
        };
      } else {
        throw new Error("Invalid response from Claude API");
      }
    } catch (error) {
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        const errorMessage =
          errorResponse?.error?.message || "Unknown API error";
        console.error(
          `Claude API error: ${errorMessage}`,
          error.response?.status
        );
        throw new Error(`Claude API error: ${errorMessage}`);
      }

      console.error("Error calling Claude API:", error);
      throw error;
    }
  }
}
