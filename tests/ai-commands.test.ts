import { CommandRegistry } from "../src/core/CommandRegistry";
import { MissionManager } from "../src/missions/MissionManager";
import { SkillTracker } from "../src/skills/SkillTracker";
import { VirtualFileSystem } from "../src/filesystem/VirtualFileSystem";
import { AIServiceManager, LocalAIService } from "../src/ai";
import { getAIServiceConfig } from "../src/ai/config";
import { AskCommand } from "../src/commands/utility/AskCommand";
import { HintCommand } from "../src/commands/utility/HintCommand";
import { initialMissions } from "../src/missions/initial-missions";

describe("AI Commands", () => {
  let commandRegistry: CommandRegistry;
  let missionManager: MissionManager;
  let skillTracker: SkillTracker;
  let filesystem: VirtualFileSystem;
  let askCommand: AskCommand;
  let hintCommand: HintCommand;

  beforeAll(async () => {
    // Initialize AI service with local provider
    const config = getAIServiceConfig({ provider: "local" });
    await AIServiceManager.initializeService(config);
  });

  beforeEach(() => {
    // Set up dependencies
    filesystem = new VirtualFileSystem();
    commandRegistry = new CommandRegistry();
    skillTracker = new SkillTracker("test_user");
    missionManager = new MissionManager(filesystem);

    // Register missions
    initialMissions.forEach((mission) => {
      missionManager.registerMission(mission);
    });

    // Create command instances
    askCommand = new AskCommand(skillTracker);
    hintCommand = new HintCommand(missionManager);
  });

  test("AskCommand should provide AI assistance", async () => {
    // Start a mission to get command tracking
    missionManager.startMission("mission_001");

    // Mock command options
    const options = {
      currentDirectory: "/home/user",
      filesystem: filesystem,
      env: {},
    };

    // Execute the ask command
    const result = await askCommand.execute(
      ["how", "do", "I", "list", "files"],
      options
    );

    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output?.includes("SUGGESTION")).toBe(true);
  });

  test("HintCommand should provide mission hints", async () => {
    // Start a mission
    missionManager.startMission("mission_001");

    // Mock command options
    const options = {
      currentDirectory: "/home/user",
      filesystem: filesystem,
      env: {},
    };

    // Get hint for the active mission
    const result = await hintCommand.execute([], options);

    expect(result.success).toBe(true);
    expect(result.output).toBeDefined();
    expect(result.output?.includes("HINT")).toBe(true);
    expect(result.output?.includes("MISSION")).toBe(true);
    // The first mission is "System Calibration"
    expect(result.output?.includes("System Calibration")).toBe(true);
  });

  test("HintCommand should fail when no mission is active", async () => {
    // Don't start any mission

    // Mock command options
    const options = {
      currentDirectory: "/home/user",
      filesystem: filesystem,
      env: {},
    };

    // Try to get a hint without an active mission
    const result = await hintCommand.execute([], options);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.includes("No active missions")).toBe(true);
  });
});
