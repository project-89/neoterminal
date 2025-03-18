import { SkillProfile } from "../../../types";
import { AIAnalysisRequest, AIAnalysisResponse } from "../AIService";
import { BaseAIService } from "../BaseAIService";
import axios from "axios";

/**
 * Google Gemini AI service implementation
 */
export class GeminiAIService extends BaseAIService {
  /**
   * Analyze a user command
   */
  public async analyzeCommand(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      if (!this.isInitialized()) {
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL. 
Your role is to analyze user commands and provide feedback that helps them learn terminal commands.
Be concise, informative, and maintain the cyberpunk aesthetic in your responses.`;

      const userPrompt = `User input: ${request.userInput}
Recent command history: ${request.commandHistory.slice(-5).join(", ")}
${this.formatSkillProfile(request.skillProfile)}`;

      // Make API call to Gemini
      const response = await this.callGeminiAPI(
        systemPrompt,
        userPrompt,
        request.context
      );

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
            : "Unknown error with Gemini API",
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
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to provide hints for mission objectives that help users learn terminal commands without giving away the entire solution.
Be concise, informative, and maintain the cyberpunk aesthetic in your responses.`;

      const userPrompt = `The user is on mission ${missionId} and is stuck on objective ${
        objectiveIndex + 1
      }.
Please provide a hint that guides them without revealing the complete solution.`;

      const response = await this.callGeminiAPI(
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
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI storyteller in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to generate engaging narrative content that fits the cyberpunk theme and responds to the user's progress.
Create atmospheric, immersive text that enhances the hacker simulation experience.`;

      const userPrompt = `Generate a brief narrative segment based on the user's current context and progress.
Keep it concise but impactful, focusing on cyberpunk themes of technology, control, and resistance.`;

      const response = await this.callGeminiAPI(
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
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to analyze a user's skill profile and provide an assessment of their command proficiency.
Focus on identifying strengths, weaknesses, and opportunities for improvement.`;

      const userPrompt = `Please analyze this user's skill profile and provide an assessment of their command proficiency:
${this.formatSkillProfile(skillProfile)}`;

      const response = await this.callGeminiAPI(systemPrompt, userPrompt);

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
      console.error("Gemini AI service requires an API key");
      return false;
    }

    if (!this.config.model) {
      // Set default model if not specified
      this.config.model = "gemini-pro";
    }

    if (!this.config.endpoint) {
      // Set default endpoint if not specified
      this.config.endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models";
    }

    return true;
  }

  /**
   * Call the Gemini API using Axios
   */
  private async callGeminiAPI(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, any>
  ): Promise<any> {
    if (!this.config?.apiKey) {
      throw new Error("API key not configured for Gemini");
    }

    const prompt = this.preparePrompt(systemPrompt, userPrompt, context);
    const baseEndpoint = this.config.endpoint!;
    const model = this.config.model!;
    const maxTokens = this.config.maxTokens || 500;
    const temperature = this.config.temperature || 0.7;
    const apiKey = this.config.apiKey;

    // Construct the full endpoint URL for the generateContent method
    const endpoint = `${baseEndpoint}/${model}:generateContent?key=${apiKey}`;

    try {
      // Log API call without sensitive information
      console.log(`[Gemini API] Calling ${model} with ${prompt.length} chars`);

      // Make API call to Google Gemini
      // Format according to Gemini API specs
      const response = await axios.post(
        endpoint,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }, { text: userPrompt }],
            },
          ],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse response based on Gemini's response format
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates[0]
      ) {
        const candidate = response.data.candidates[0];

        if (
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts[0]
        ) {
          const text = candidate.content.parts[0].text || "";

          // For simplicity, we'll return a basic structure that our system expects
          return {
            suggestion: text,
            feedback: "",
            skillAssessment: {
              commandProficiency: {},
            },
          };
        }
      }

      throw new Error("Invalid response from Gemini API");
    } catch (error) {
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        const errorMessage =
          errorResponse?.error?.message || "Unknown API error";
        console.error(
          `Gemini API error: ${errorMessage}`,
          error.response?.status
        );
        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }
}
