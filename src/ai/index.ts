// Export interfaces and base classes
export * from "./AIService";
export * from "./AIServiceManager";
export * from "./BaseAIService";

// Export providers
export { ClaudeAIService } from "./providers/ClaudeAIService";
export { GeminiAIService } from "./providers/GeminiAIService";
export { LocalAIService } from "./providers/LocalAIService";

// Initialize service manager with available providers
import { AIServiceManager } from "./AIServiceManager";
import { ClaudeAIService } from "./providers/ClaudeAIService";
import { GeminiAIService } from "./providers/GeminiAIService";
import { LocalAIService } from "./providers/LocalAIService";
import { OpenAIService } from "./services/OpenAIService";

// Register providers with the service manager
const serviceManager = AIServiceManager.getInstance();
serviceManager.registerProvider("claude", ClaudeAIService);
serviceManager.registerProvider("gemini", GeminiAIService);
serviceManager.registerProvider("local", LocalAIService);
serviceManager.registerProvider("openai", OpenAIService);

export { serviceManager as AIServiceManager };
