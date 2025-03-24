/**
 * AI Service Manager for narrative content generation
 */

import { AIConfig } from "./config";

export class AIServiceManager {
  private static initialized: boolean = false;
  private static service: any = null;

  public static async initializeService(config: AIConfig): Promise<boolean> {
    console.log("Initializing AI service", config);
    AIServiceManager.initialized = true;
    AIServiceManager.service = {
      async generateNarrativeContent(
        prompt: string,
        context: any
      ): Promise<string> {
        return `Generated content for ${prompt}`;
      },
    };
    return true;
  }

  public static hasInitializedService(): boolean {
    return AIServiceManager.initialized;
  }

  public static getCurrentService(): any {
    return AIServiceManager.service;
  }
}

// Re-export the config loader
export { loadConfig } from "./config";
