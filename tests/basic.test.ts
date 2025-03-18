import { CommandRegistry } from "../src/core/CommandRegistry";
import { VirtualFileSystem } from "../src/filesystem/VirtualFileSystem";
import { CdCommand } from "../src/commands/navigation/CdCommand";
import { LsCommand } from "../src/commands/navigation/LsCommand";
import { PwdCommand } from "../src/commands/navigation/PwdCommand";

// Basic tests for core components
describe("NEOTERMINAL Core Components", () => {
  // Test the virtual filesystem
  describe("VirtualFileSystem", () => {
    let fs: VirtualFileSystem;

    beforeEach(() => {
      fs = new VirtualFileSystem();
    });

    test("should have a working filesystem with initial structure", () => {
      expect(fs.getCurrentPath()).toBe("/home/user");

      // Root directory exists
      const root = fs.getNode("/");
      expect(root).toBeTruthy();

      // Home directory exists
      const home = fs.getNode("/home");
      expect(home).toBeTruthy();

      // User directory exists
      const user = fs.getNode("/home/user");
      expect(user).toBeTruthy();
    });

    test("should create and read files", () => {
      // Create a test file
      fs.writeFile("/home/user/test.txt", "Hello, world!");

      // Read the file
      const content = fs.readFile("/home/user/test.txt");
      expect(content.toString()).toBe("Hello, world!");
    });

    test("should create and navigate directories", () => {
      // Create a test directory
      fs.mkdir("/home/user/testdir");

      // Change to that directory
      fs.changeDirectory("/home/user/testdir");

      // Check current path
      expect(fs.getCurrentPath()).toBe("/home/user/testdir");
    });
  });

  // Test the command registry
  describe("CommandRegistry", () => {
    let registry: CommandRegistry;

    beforeEach(() => {
      registry = new CommandRegistry();
    });

    test("should register and retrieve commands", () => {
      const cdCommand = new CdCommand();
      registry.registerCommand(cdCommand);

      // Get by name
      const retrieved = registry.getCommand("cd");
      expect(retrieved).toBe(cdCommand);

      // Get by alias
      const byAlias = registry.getCommand("chdir");
      expect(byAlias).toBe(cdCommand);
    });

    test("should register multiple commands", () => {
      registry.registerCommand(new CdCommand());
      registry.registerCommand(new LsCommand());
      registry.registerCommand(new PwdCommand());

      const commands = registry.getAllCommands();
      expect(commands.length).toBe(3);
    });

    test("should unregister commands", () => {
      registry.registerCommand(new CdCommand());
      expect(registry.hasCommand("cd")).toBe(true);

      registry.unregisterCommand("cd");
      expect(registry.hasCommand("cd")).toBe(false);
    });
  });
});
