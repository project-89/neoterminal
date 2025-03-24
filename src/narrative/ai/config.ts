/**
 * AI Configuration loader
 */

export interface AIServiceConfig {
  serviceType: string;
  apiKey?: string;
  model?: string;
  options?: Record<string, any>;
}

export interface AIConfig {
  defaultService: string;
  services: Record<string, AIServiceConfig>;
}

/**
 * Load the AI service configuration
 */
export async function loadConfig(): Promise<AIConfig> {
  // In a real implementation, this would load from a config file or environment
  return {
    defaultService: "default",
    services: {
      default: {
        serviceType: "mock",
        model: "narrative-v1",
        options: {
          temperature: 0.7,
          maxTokens: 500,
        },
      },
    },
  };
}
