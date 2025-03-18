import { AIServiceManager, LocalAIService } from "../src/ai";
import { getAIServiceConfig } from "../src/ai/config";
import { AIAnalysisRequest } from "../src/ai/AIService";
import {
  SkillProfile,
  SkillLevel,
  CommandProficiency,
  CommandCategory,
} from "../types";

describe("AI Service Integration", () => {
  beforeAll(async () => {
    // Initialize with local provider for basic tests
    const config = getAIServiceConfig({ provider: "local" });
    await AIServiceManager.initializeService(config);
  });

  test("AI service provides response to command analysis", async () => {
    const service = AIServiceManager.getCurrentService();

    // Create a test skill profile with proper CommandProficiency objects
    const now = new Date();
    const skillProfile: SkillProfile = {
      userId: "test_user",
      overallLevel: SkillLevel.INITIATE,
      categoryLevels: new Map([[CommandCategory.NAVIGATION, 2]]),
      commandProficiency: new Map([
        [
          "ls",
          {
            command: "ls",
            executionCount: 5,
            successfulExecutions: 5,
            averageExecutionTime: 0.1,
            lastUsed: now,
            proficiencyScore: 70,
            commonErrors: [],
          },
        ],
        [
          "cd",
          {
            command: "cd",
            executionCount: 3,
            successfulExecutions: 3,
            averageExecutionTime: 0.05,
            lastUsed: now,
            proficiencyScore: 60,
            commonErrors: [],
          },
        ],
      ]),
      missionsCompleted: [],
      lastUpdated: now,
    };

    // Create a test request
    const request: AIAnalysisRequest = {
      userInput: "How do I view hidden files?",
      commandHistory: ["ls", "cd", "pwd"],
      skillProfile,
    };

    // Test the service response
    const response = await service.analyzeCommand(request);

    expect(response).toBeDefined();
    expect(response.suggestion).toBeDefined();
    expect(response.error).toBeUndefined();
  });

  test("AI service generates mission hints", async () => {
    const service = AIServiceManager.getCurrentService();

    const hint = await service.generateHint("mission_001", 0, {
      currentDirectory: "/home/user",
    });

    expect(hint).toBeDefined();
    expect(typeof hint).toBe("string");
    expect(hint.length).toBeGreaterThan(0);
  });
});
