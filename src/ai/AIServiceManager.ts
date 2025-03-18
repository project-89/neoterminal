import { AIService, AIServiceConfig } from "./AIService";

/**
 * Manages AI service providers and their configurations
 */
export class AIServiceManager {
  private static instance: AIServiceManager;
  private providers: Map<string, new () => AIService> = new Map();
  private currentService: AIService | null = null;
  private config: AIServiceConfig | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  /**
   * Register an AI service provider
   */
  public registerProvider(
    name: string,
    providerClass: new () => AIService
  ): void {
    this.providers.set(name.toLowerCase(), providerClass);
  }

  /**
   * Get a list of available providers
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Initialize an AI service with configuration
   */
  public async initializeService(config: AIServiceConfig): Promise<boolean> {
    const providerName = config.provider.toLowerCase();
    const ProviderClass = this.providers.get(providerName);

    if (!ProviderClass) {
      throw new Error(`AI provider '${config.provider}' not found`);
    }

    // Create a new instance of the provider
    const service = new ProviderClass();

    // Initialize with config
    const initialized = await service.initialize(config);

    if (initialized) {
      this.currentService = service;
      this.config = config;
    }

    return initialized;
  }

  /**
   * Get the current AI service
   */
  public getCurrentService(): AIService {
    if (!this.currentService) {
      throw new Error("No AI service has been initialized");
    }
    return this.currentService;
  }

  /**
   * Get current configuration
   */
  public getCurrentConfig(): AIServiceConfig | null {
    return this.config;
  }

  /**
   * Check if any service is initialized
   */
  public hasInitializedService(): boolean {
    return this.currentService !== null && this.currentService.isInitialized();
  }
}
