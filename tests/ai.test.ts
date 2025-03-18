import { AIServiceManager, LocalAIService } from "../src/ai";
import { getAIServiceConfig } from "../src/ai/config";

describe("AI Service Integration", () => {
  beforeEach(() => {
    // Reset the service manager for each test
    jest.resetModules();
  });

  test("should initialize the LocalAIService successfully", async () => {
    // Configure to use local service
    const config = getAIServiceConfig({ provider: "local" });
    const initialized = await AIServiceManager.initializeService(config);

    expect(initialized).toBe(true);
    expect(AIServiceManager.hasInitializedService()).toBe(true);

    const service = AIServiceManager.getCurrentService();
    expect(service).toBeDefined();
    expect(service.isInitialized()).toBe(true);
  });

  test("LocalAIService should provide command analysis without external API", async () => {
    // Initialize local service
    const config = getAIServiceConfig({ provider: "local" });
    await AIServiceManager.initializeService(config);

    const service = AIServiceManager.getCurrentService();

    // Mock skill profile
    const mockSkillProfile = {
      userId: "test_user",
      overallLevel: 1,
      categoryLevels: new Map(),
      commandProficiency: new Map(),
      missionsCompleted: [],
      lastUpdated: new Date(),
    };

    // Analyze a command
    const response = await service.analyzeCommand({
      userInput: "ls",
      commandHistory: ["cd /home", "pwd", "ls"],
      skillProfile: mockSkillProfile,
    });

    expect(response).toBeDefined();
    expect(response.error).toBeUndefined();
    expect(response.suggestion).toBeDefined();
    expect(response.feedback).toBeDefined();
    expect(response.skillAssessment).toBeDefined();
  });

  test("LocalAIService should provide hints for missions", async () => {
    // Initialize local service
    const config = getAIServiceConfig({ provider: "local" });
    await AIServiceManager.initializeService(config);

    const service = AIServiceManager.getCurrentService();

    // Get hint for a mission
    const hint = await service.generateHint("mission_001", 0, {
      mission: {
        id: "mission_001",
        title: "System Calibration",
        description: "Learn to navigate the terminal interface",
      },
    });

    expect(hint).toBeDefined();
    expect(hint.length).toBeGreaterThan(0);
  });

  test("Should fail to initialize with invalid provider", async () => {
    try {
      const config = getAIServiceConfig({ provider: "invalid_provider" });
      await AIServiceManager.initializeService(config);

      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("not found");
    }
  });

  test("Should properly merge custom configuration", () => {
    // Test with direct configuration parameters
    const customConfig = {
      provider: "local",
      temperature: 0.5,
      maxTokens: 200,
    };

    const config = getAIServiceConfig(customConfig);

    expect(config.provider).toBe("local");
    expect(config.temperature).toBe(0.5);
    expect(config.maxTokens).toBe(200);
  });
});
