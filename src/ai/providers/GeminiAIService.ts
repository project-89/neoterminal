import { SkillProfile } from "../../../types";
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  ConversationMessage,
} from "../AIService";
import { BaseAIService } from "../BaseAIService";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Google Gemini AI service implementation
 */
export class GeminiAIService extends BaseAIService {
  private genAI: GoogleGenerativeAI | null = null;

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

      // Generate feedback using our generateResponse method
      const responseText = await this.generateResponse([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      return {
        suggestion: responseText,
        feedback: responseText,
        skillAssessment: {
          commandProficiency: 50, // Default medium proficiency score
          recommendedCommands: [],
          suggestedNextSteps: [],
        },
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
      if (!this.isInitialized() || !this.genAI) {
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to provide hints for mission objectives that help users learn terminal commands without giving away the entire solution.
Be concise, informative, and maintain the cyberpunk aesthetic in your responses.`;

      const userPrompt = `The user is on mission ${missionId} and is stuck on objective ${
        objectiveIndex + 1
      }.
Please provide a hint that guides them without revealing the complete solution.`;

      // Use our generateResponse method directly
      const response = await this.generateResponse([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      return response || "No hint available at this time.";
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
      if (!this.isInitialized() || !this.genAI) {
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI storyteller in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to generate engaging narrative content that fits the cyberpunk theme and responds to the user's progress.
Create atmospheric, immersive text that enhances the hacker simulation experience.`;

      const userPrompt = `Generate a brief narrative segment based on the user's current context and progress.
Keep it concise but impactful, focusing on cyberpunk themes of technology, control, and resistance.`;

      // Use our generateResponse method directly
      const response = await this.generateResponse([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      return response || "Narrative generation unavailable.";
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
      if (!this.isInitialized() || !this.genAI) {
        throw new Error("Gemini AI service not initialized");
      }

      const systemPrompt = `You are an AI assistant in a cyberpunk terminal simulator called NEOTERMINAL.
Your role is to analyze a user's skill profile and provide an assessment of their command proficiency.
Focus on identifying strengths, weaknesses, and opportunities for improvement.`;

      const userPrompt = `Please analyze this user's skill profile and provide an assessment of their command proficiency:
${this.formatSkillProfile(skillProfile)}`;

      // Use our generateResponse method directly
      await this.generateResponse([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      // For now, we'll just return a basic assessment based on the profile data
      // A more sophisticated implementation could parse the response for insights
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

    // Initialize the Google generative AI client
    try {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      return true;
    } catch (error) {
      console.error("Failed to initialize Google Generative AI client:", error);
      return false;
    }
  }

  /**
   * Call the Gemini API using the official Google client
   */
  private async callGeminiAPI(
    systemPrompt: string,
    userPrompt: string,
    context?: Record<string, any>
  ): Promise<any> {
    if (!this.config?.apiKey || !this.genAI) {
      throw new Error(
        "API key not configured for Gemini or client not initialized"
      );
    }

    try {
      const model = this.config.model || "gemini-pro";
      const genModel = this.genAI.getGenerativeModel({ model });

      // Log API call without sensitive information
      console.log(`[Gemini API] Calling ${model} with prompt`);

      // Create prompt parts
      const parts = [{ text: userPrompt }];
      if (context) {
        parts.unshift({ text: `Context: ${JSON.stringify(context)}` });
      }
      if (systemPrompt) {
        parts.unshift({ text: systemPrompt });
      }

      // Generate content
      const result = await genModel.generateContent(parts);
      const response = result.response;
      const text = response.text();

      // For simplicity, we'll return a basic structure that our system expects
      return {
        suggestion: text,
        feedback: text,
        skillAssessment: {
          commandProficiency: 50, // Default medium proficiency score
          recommendedCommands: [],
          suggestedNextSteps: [],
        },
      };
    } catch (error) {
      // Enhanced error handling
      console.error("Error calling Gemini API:", error);
      throw new Error(
        `Gemini API error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate a response from conversation history
   * @param messages An array of conversation messages with roles and content
   * @returns The generated response text
   */
  public async generateResponse(
    messages: ConversationMessage[]
  ): Promise<string> {
    this.ensureInitialized();

    try {
      if (!this.genAI) {
        throw new Error("Google Generative AI client not initialized");
      }

      const model = this.config?.model || "gemini-pro";
      const genModel = this.genAI.getGenerativeModel({ model });

      // Extract system prompt if present
      let systemPrompt = "";
      let userMessages: ConversationMessage[] = [];

      // Find the first system message and extract it
      const systemMessageIndex = messages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMessageIndex >= 0) {
        systemPrompt = messages[systemMessageIndex].content;
        userMessages = messages.filter(
          (_, index) => index !== systemMessageIndex
        );
      } else {
        userMessages = [...messages];
      }

      // If we don't have any user messages, create a simple prompt
      if (userMessages.length === 0) {
        return await this.generateSimpleResponse(
          systemPrompt || "Please respond to this message."
        );
      }

      // Find the last user message
      const lastUserMessageIndex = userMessages
        .map((msg) => msg.role)
        .lastIndexOf("user");
      if (lastUserMessageIndex === -1) {
        // If there's no user message, we need to create one
        return await this.generateSimpleResponse(
          "Please respond to this message."
        );
      }

      // Prepare a prompt that combines the system prompt and the most recent user message
      const lastUserMessage = userMessages[lastUserMessageIndex].content;
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${lastUserMessage}`
        : lastUserMessage;

      // Use the simple content generation approach instead of chat
      const result = await genModel.generateContent(fullPrompt);
      return result.response.text();
    } catch (error) {
      console.error("[GeminiAIService] Error generating response:", error);
      throw new Error(
        `Failed to generate response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate a simple response without using chat history
   * @param prompt The text prompt
   * @returns Generated response text
   */
  private async generateSimpleResponse(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error("Google Generative AI client not initialized");
    }

    const model = this.config?.model || "gemini-pro";
    const genModel = this.genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: this.config?.temperature || 0.7,
        maxOutputTokens: this.config?.maxTokens || 1000,
      },
    });

    try {
      const result = await genModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(
        "[GeminiAIService] Error generating simple response:",
        error
      );
      throw error;
    }
  }
}
