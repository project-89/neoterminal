import { AIServiceConfig } from "./AIService";
import * as fs from "fs";
import * as path from "path";

/**
 * Default config values
 */
const defaultConfig: AIServiceConfig = {
  provider: process.env.AI_PROVIDER || "local",
  apiKey: process.env.AI_API_KEY || "",
  model: process.env.AI_MODEL || "",
  temperature: process.env.AI_TEMPERATURE
    ? parseFloat(process.env.AI_TEMPERATURE)
    : 0.7,
  maxTokens: process.env.AI_MAX_TOKENS
    ? parseInt(process.env.AI_MAX_TOKENS)
    : 500,
};

/**
 * Provider-specific default configs
 */
const providerDefaults: Record<string, Partial<AIServiceConfig>> = {
  claude: {
    model: "claude-3-sonnet-20240229",
    endpoint: "https://api.anthropic.com/v1/messages",
  },
  gemini: {
    model: "gemini-pro",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  local: {
    // Local provider doesn't need API credentials
  },
};

/**
 * Get full configuration with defaults applied
 */
export function getAIServiceConfig(
  customConfig?: Partial<AIServiceConfig>
): AIServiceConfig {
  // Start with default config
  const config: AIServiceConfig = { ...defaultConfig };

  // Apply provider-specific defaults
  const provider = customConfig?.provider || config.provider;
  const providerConfig = providerDefaults[provider];

  if (providerConfig) {
    Object.assign(config, providerConfig);
  }

  // Apply any custom configuration
  if (customConfig) {
    Object.assign(config, customConfig);
  }

  return config;
}

/**
 * Load config from a JSON file
 */
export function loadConfigFromFile(filePath: string): AIServiceConfig {
  try {
    // Resolve the path (if relative)
    const resolvedPath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`AI config file not found: ${resolvedPath}`);
      return getAIServiceConfig();
    }

    // Read and parse the file
    const fileContent = fs.readFileSync(resolvedPath, "utf8");
    const fileConfig = JSON.parse(fileContent);

    // Remove any comment fields that aren't part of the actual config
    Object.keys(fileConfig).forEach((key) => {
      if (key.startsWith("comment")) {
        delete fileConfig[key];
      }
    });

    return getAIServiceConfig(fileConfig);
  } catch (error) {
    console.warn(
      `Failed to load AI config from ${filePath}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return getAIServiceConfig();
  }
}

/**
 * Load AI configuration from environment variables or use defaults
 */
export async function loadConfig(): Promise<AIServiceConfig> {
  const provider = process.env.AI_PROVIDER || "local";

  // Determine the API key based on the provider
  let apiKey = "";
  if (provider === "openai") {
    apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "";
  } else if (provider === "claude") {
    apiKey = process.env.CLAUDE_API_KEY || process.env.AI_API_KEY || "";
  } else if (provider === "gemini") {
    apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
  } else {
    apiKey = process.env.AI_API_KEY || "";
  }

  return {
    provider,
    apiKey,
    model: process.env.AI_MODEL || getDefaultModelForProvider(provider),
    temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || "1000", 10),
    endpoint:
      process.env.AI_ENDPOINT || getDefaultEndpointForProvider(provider),
  };
}

/**
 * Get the default model for a provider
 */
function getDefaultModelForProvider(provider: string): string {
  switch (provider) {
    case "openai":
      return "gpt-3.5-turbo";
    case "claude":
      return "claude-3-sonnet-20240229";
    case "gemini":
      return "gemini-pro";
    default:
      return "";
  }
}

/**
 * Get the default endpoint for a provider
 */
function getDefaultEndpointForProvider(provider: string): string | undefined {
  switch (provider) {
    case "claude":
      return "https://api.anthropic.com/v1/messages";
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta/models";
    default:
      return undefined;
  }
}

/**
 * Check if AI is properly configured
 */
export function isAIConfigured(): boolean {
  const provider = process.env.AI_PROVIDER || "local";

  // Check configuration based on provider
  switch (provider) {
    case "openai":
      return !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
    case "claude":
      return !!(process.env.CLAUDE_API_KEY || process.env.AI_API_KEY);
    case "gemini":
      return !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
    case "local":
      return true; // Local provider doesn't require credentials
    default:
      return false;
  }
}
