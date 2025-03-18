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
 * Try to load config from standard locations,
 * falling back to environment variables if no file is found
 */
export function loadConfig(): AIServiceConfig {
  // Possible config file locations in order of precedence
  const configPaths = [
    // Environment variable specified path
    process.env.AI_CONFIG_PATH,
    // Current directory
    "./ai-config.json",
    // User home directory
    path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".neoterminal",
      "ai-config.json"
    ),
  ].filter(Boolean) as string[];

  // Try each path
  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        console.log(`Loading AI config from ${configPath}`);
        return loadConfigFromFile(configPath);
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // Fall back to environment variables
  console.log(
    "No AI config file found, using environment variables or defaults"
  );
  return getAIServiceConfig();
}
