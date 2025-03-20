/**
 * NEOTERMINAL Web Application
 *
 * This is a browser-compatible implementation of the NEOTERMINAL application,
 * allowing the full terminal experience in a web environment.
 */

class WebTerminalApp {
  constructor(terminal) {
    this.terminal = terminal;
    this.inputBuffer = "";
    this.commandHistory = [];
    this.historyPosition = -1;
    this.prompt = "> ";
    this.filesystem = new VirtualFileSystem();
    this.commandRegistry = new CommandRegistry();
    this.animations = new TerminalAnimations(terminal);
    this.isProcessingKey = false; // Flag to prevent double processing

    // Initialize the application
    this.initializeCommands();
    this.setupInputHandling();
    this.displayWelcomeScreen();
  }

  /**
   * Initialize the command registry with available commands
   */
  initializeCommands() {
    // Navigation commands
    this.commandRegistry.registerCommand("cd", this.cdCommand.bind(this));
    this.commandRegistry.registerCommand("ls", this.lsCommand.bind(this));
    this.commandRegistry.registerCommand("pwd", this.pwdCommand.bind(this));

    // File operation commands
    this.commandRegistry.registerCommand("cat", this.catCommand.bind(this));
    this.commandRegistry.registerCommand("mkdir", this.mkdirCommand.bind(this));
    this.commandRegistry.registerCommand("touch", this.touchCommand.bind(this));

    // ASCII art command
    this.commandRegistry.registerCommand("ascii", this.asciiCommand.bind(this));

    // Animation commands
    this.commandRegistry.registerCommand(
      "animation",
      this.animationCommand.bind(this)
    );

    // Utility commands
    this.commandRegistry.registerCommand("clear", this.clearCommand.bind(this));
    this.commandRegistry.registerCommand("help", this.helpCommand.bind(this));
    this.commandRegistry.registerCommand(
      "mission",
      this.missionCommand.bind(this)
    );
  }

  /**
   * Set up input handling for the terminal
   */
  setupInputHandling() {
    this.terminal.onData((data) => {
      // Prevent double-processing of keys
      if (this.isProcessingKey) return;
      this.isProcessingKey = true;

      setTimeout(() => {
        this.isProcessingKey = false;
      }, 10);

      const code = data.charCodeAt(0);

      // Handle special keys
      if (data === "\r") {
        // Enter
        this.terminal.write("\r\n");
        this.processCommand();
      } else if (data === "\u007F") {
        // Backspace
        if (this.inputBuffer.length > 0) {
          this.inputBuffer = this.inputBuffer.substring(
            0,
            this.inputBuffer.length - 1
          );
          this.terminal.write("\b \b");
        }
      } else if (data === "\u001b[A") {
        // Up arrow
        this.navigateHistory(-1);
      } else if (data === "\u001b[B") {
        // Down arrow
        this.navigateHistory(1);
      } else if (data === "\t") {
        // Tab (for future autocomplete)
        // TODO: Implement tab completion
      } else if (code >= 32 && code <= 126) {
        // Printable characters
        this.inputBuffer += data;
        this.terminal.write(data);
      }
    });
  }

  /**
   * Process the current command in the input buffer
   */
  processCommand() {
    const command = this.inputBuffer.trim();
    this.inputBuffer = "";

    if (command) {
      this.commandHistory.push(command);
      this.historyPosition = -1;

      // Parse the command
      const parts = command.split(" ");
      const cmdName = parts[0];
      const args = parts.slice(1);

      // Execute the command
      const cmd = this.commandRegistry.getCommand(cmdName);
      if (cmd) {
        cmd(args);
      } else {
        this.terminal.writeln(`\x1b[31mCommand not found: ${cmdName}\x1b[0m`);
        this.displayPrompt();
      }
    } else {
      this.displayPrompt();
    }
  }

  /**
   * Navigate through command history
   */
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    // Update history position
    if (
      direction < 0 &&
      this.historyPosition < this.commandHistory.length - 1
    ) {
      this.historyPosition++;
    } else if (direction > 0 && this.historyPosition >= 0) {
      this.historyPosition--;
    }

    // Clear current input
    this.terminal.write("\r\x1b[K" + this.prompt);

    // Display selected command from history
    if (this.historyPosition >= 0) {
      const historyItem =
        this.commandHistory[
          this.commandHistory.length - 1 - this.historyPosition
        ];
      this.inputBuffer = historyItem;
      this.terminal.write(historyItem);
    } else {
      this.inputBuffer = "";
    }
  }

  /**
   * Display the command prompt
   */
  displayPrompt() {
    this.terminal.write(this.prompt);
  }

  /**
   * Display the welcome screen
   */
  displayWelcomeScreen() {
    // Clear terminal first
    this.terminal.clear();

    // Display terminal logo in cyan with proper formatting
    this.terminal.writeln("\x1b[36m");
    asciiArt.terminal_logo.split("\n").forEach((line) => {
      this.terminal.writeln(line);
    });
    this.terminal.writeln("\x1b[0m");

    this.terminal.writeln(
      "\r\n\x1b[1;33mWelcome to NEOTERMINAL Web Interface\x1b[0m"
    );
    this.terminal.writeln(
      "You have been recruited by GHOST//SIGNAL, a hacktivist collective"
    );
    this.terminal.writeln("fighting against corporate control of cyberspace.");
    this.terminal.writeln(
      "\r\nType \x1b[36mhelp\x1b[0m for a list of available commands."
    );
    this.terminal.writeln(
      "Type \x1b[36mmission\x1b[0m to view your first mission.\r\n"
    );

    this.displayPrompt();
  }

  // Command implementations

  /**
   * Change directory command
   */
  cdCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: cd <directory>");
    } else {
      try {
        this.filesystem.changeDirectory(args[0]);
        this.terminal.writeln(
          `Changed directory to: ${this.filesystem.getCurrentPath()}`
        );
      } catch (error) {
        this.terminal.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
      }
    }
    this.displayPrompt();
  }

  /**
   * List directory contents command
   */
  lsCommand(args) {
    try {
      const path = args.length > 0 ? args[0] : this.filesystem.getCurrentPath();
      const contents = this.filesystem.listDirectory(path);

      if (contents.length === 0) {
        this.terminal.writeln("Directory is empty");
      } else {
        // Group entries by type
        const directories = contents.filter(
          (entry) => entry.type === "directory"
        );
        const files = contents.filter((entry) => entry.type === "file");

        // Sort alphabetically
        directories.sort((a, b) => a.name.localeCompare(b.name));
        files.sort((a, b) => a.name.localeCompare(b.name));

        // Display directories in blue
        for (const dir of directories) {
          this.terminal.writeln(`\x1b[34m${dir.name}/\x1b[0m`);
        }

        // Display files in green
        for (const file of files) {
          this.terminal.writeln(`\x1b[32m${file.name}\x1b[0m`);
        }
      }
    } catch (error) {
      this.terminal.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
    }

    this.displayPrompt();
  }

  /**
   * Print working directory command
   */
  pwdCommand(args) {
    this.terminal.writeln(this.filesystem.getCurrentPath());
    this.displayPrompt();
  }

  /**
   * Display file contents command
   */
  catCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: cat <file>");
    } else {
      try {
        const content = this.filesystem.readFile(args[0]);
        this.terminal.writeln(content);
      } catch (error) {
        this.terminal.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
      }
    }
    this.displayPrompt();
  }

  /**
   * Create directory command
   */
  mkdirCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: mkdir <directory>");
    } else {
      try {
        this.filesystem.mkdir(args[0]);
        this.terminal.writeln(`Created directory: ${args[0]}`);
      } catch (error) {
        this.terminal.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
      }
    }
    this.displayPrompt();
  }

  /**
   * Create file command
   */
  touchCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: touch <file>");
    } else {
      try {
        this.filesystem.writeFile(args[0], "");
        this.terminal.writeln(`Created file: ${args[0]}`);
      } catch (error) {
        this.terminal.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
      }
    }
    this.displayPrompt();
  }

  /**
   * Display mission command
   */
  missionCommand(args) {
    const missionId = args.length > 0 ? args[0] : "001";

    try {
      this.terminal.writeln(
        `\x1b[1;36mLoading mission ${missionId}...\x1b[0m\r\n`
      );

      // Try to read from virtual filesystem first
      const missionPath = `/home/user/missions/mission_${missionId}.txt`;
      try {
        const content = this.filesystem.readFile(missionPath);
        this.terminal.writeln(content);
      } catch (error) {
        // If file not found, show default mission content
        this.terminal.writeln(
          "\x1b[1;33mMISSION #001: SYSTEM CALIBRATION\x1b[0m\r\n"
        );
        this.terminal.writeln(
          "Objective: Familiarize yourself with the system\r\n"
        );
        this.terminal.writeln("\x1b[36mTasks:\x1b[0m");
        this.terminal.writeln("1. Navigate the filesystem using cd and ls");
        this.terminal.writeln("2. View file contents with cat");
        this.terminal.writeln("3. Create a new directory and file");
        this.terminal.writeln(
          "\r\nComplete these tasks to ensure your terminal is functioning properly."
        );
      }
    } catch (error) {
      this.terminal.writeln(
        `\x1b[31mError loading mission: ${error.message}\x1b[0m`
      );
    }

    this.displayPrompt();
  }

  /**
   * ASCII art command
   */
  asciiCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: ascii <art_name> [--option]");
      this.terminal.writeln(
        "Available art: terminal_logo, hacker, neural_network"
      );
      this.terminal.writeln("Options: --glitch, --rainbow, --pulse");
    } else {
      const artName = args[0];
      const art = asciiArt[artName];

      if (!art) {
        this.terminal.writeln(`\x1b[31mArt not found: ${artName}\x1b[0m`);
      } else if (args.includes("--glitch")) {
        this.animations.applyGlitchEffect(art, 5000, 0.3);
        return; // Animation will handle the prompt
      } else if (args.includes("--pulse")) {
        this.animations.applyPulseEffect(art, 5000);
        return; // Animation will handle the prompt
      } else if (args.includes("--rainbow")) {
        const colors = [
          "\x1b[31m", // Red
          "\x1b[33m", // Yellow
          "\x1b[32m", // Green
          "\x1b[36m", // Cyan
          "\x1b[34m", // Blue
          "\x1b[35m", // Magenta
        ];

        // Split art into lines
        const lines = art.split("\n");

        // Display each line with a different color
        for (let i = 0; i < lines.length; i++) {
          const colorIndex = i % colors.length;
          this.terminal.writeln(colors[colorIndex] + lines[i] + "\x1b[0m");
        }
      } else {
        // Default - display in cyan
        this.terminal.writeln("\x1b[36m" + art + "\x1b[0m");
      }
    }

    this.displayPrompt();
  }

  /**
   * Animation command
   */
  animationCommand(args) {
    if (args.length === 0) {
      this.terminal.writeln("Usage: animation <type> [options]");
      this.terminal.writeln("Types: glitch, matrix, typing, pulse");
    } else {
      const type = args[0];

      switch (type) {
        case "glitch":
          this.animations.applyGlitchEffect(asciiArt.hacker, 5000, 0.3);
          return; // Animation will handle the prompt

        case "matrix":
          this.animations.applyMatrixRain(8000);
          return; // Animation will handle the prompt

        case "typing":
          const text =
            args.length > 1
              ? args.slice(1).join(" ")
              : "Initializing neural interface... Connection established. Welcome to the network, Netrunner.";
          this.animations.applyTypingEffect(text, 4000);
          return; // Animation will handle the prompt

        case "pulse":
          this.animations.applyPulseEffect(asciiArt.neural_network, 5000);
          return; // Animation will handle the prompt

        default:
          this.terminal.writeln(
            `\x1b[31mUnknown animation type: ${type}\x1b[0m`
          );
      }
    }

    this.displayPrompt();
  }

  /**
   * Clear screen command
   */
  clearCommand(args) {
    this.terminal.clear();
    this.displayPrompt();
  }

  /**
   * Help command
   */
  helpCommand(args) {
    this.terminal.writeln("\x1b[1;36mAvailable Commands:\x1b[0m");
    this.terminal.writeln("\x1b[33mNavigation:\x1b[0m");
    this.terminal.writeln("  cd <directory>    - Change directory");
    this.terminal.writeln("  ls [path]         - List directory contents");
    this.terminal.writeln("  pwd               - Print working directory");
    this.terminal.writeln("\x1b[33mFile Operations:\x1b[0m");
    this.terminal.writeln("  cat <file>        - Display file contents");
    this.terminal.writeln("  mkdir <directory> - Create directory");
    this.terminal.writeln("  touch <file>      - Create empty file");
    this.terminal.writeln("\x1b[33mSpecial Features:\x1b[0m");
    this.terminal.writeln("  ascii <art> [options] - Display ASCII art");
    this.terminal.writeln("      Options: --glitch, --rainbow, --pulse");
    this.terminal.writeln("  animation <type>      - Play animation");
    this.terminal.writeln("      Types: glitch, matrix, typing, pulse");
    this.terminal.writeln("  mission [id]       - Display mission details");
    this.terminal.writeln("\x1b[33mUtility:\x1b[0m");
    this.terminal.writeln("  clear             - Clear screen");
    this.terminal.writeln("  help              - Display this help");
    this.terminal.writeln("\r\nUse arrow keys to navigate command history");

    this.displayPrompt();
  }
}

/**
 * Simple command registry
 */
class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  registerCommand(name, callback) {
    this.commands.set(name, callback);
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return Array.from(this.commands.keys());
  }
}

/**
 * Basic virtual filesystem
 */
class VirtualFileSystem {
  constructor() {
    // Initialize root filesystem
    this.root = {
      type: "directory",
      name: "/",
      children: {},
    };

    this.currentPath = "/home/user";

    // Create initial directory structure
    this.initializeFileSystem();
  }

  initializeFileSystem() {
    // Create basic directory structure
    this.mkdir("/home");
    this.mkdir("/home/user");
    this.mkdir("/home/user/missions");
    this.mkdir("/home/user/docs");
    this.mkdir("/home/user/tools");

    // Create some initial files
    this.writeFile(
      "/home/user/README.txt",
      "WELCOME TO NEOTERMINAL\n\n" +
        "You have been recruited by GHOST//SIGNAL, a hacktivist collective\n" +
        "fighting against corporate control of cyberspace.\n\n" +
        'Type "help" for a list of available commands.\n' +
        'Type "mission" to view your first mission.\n'
    );

    this.writeFile(
      "/home/user/missions/mission_001.txt",
      "MISSION #001: SYSTEM CALIBRATION\n\n" +
        "Objective: Familiarize yourself with the system\n\n" +
        "Tasks:\n" +
        "1. Navigate the filesystem using cd and ls\n" +
        "2. View file contents with cat\n" +
        "3. Create a new directory and file\n\n" +
        "Complete these tasks to ensure your terminal is functioning properly."
    );
  }

  getCurrentPath() {
    return this.currentPath;
  }

  changeDirectory(path) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }

    if (node.type !== "directory") {
      throw new Error(`Not a directory: ${path}`);
    }

    this.currentPath = targetPath;
  }

  listDirectory(path) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      throw new Error(`Directory not found: ${path}`);
    }

    if (node.type !== "directory") {
      throw new Error(`Not a directory: ${path}`);
    }

    return Object.values(node.children).map((child) => ({
      name: child.name,
      type: child.type,
    }));
  }

  readFile(path) {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);

    if (!node) {
      throw new Error(`File not found: ${path}`);
    }

    if (node.type !== "file") {
      throw new Error(`Not a file: ${path}`);
    }

    return node.content;
  }

  writeFile(path, content) {
    const targetPath = this.resolvePath(path);
    const parentPath = this.getParentPath(targetPath);
    const fileName = this.getBaseName(targetPath);

    // Ensure parent directory exists
    const parent = this.getNode(parentPath);
    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    if (parent.type !== "directory") {
      throw new Error(`Parent is not a directory: ${parentPath}`);
    }

    // Create or update file
    parent.children[fileName] = {
      type: "file",
      name: fileName,
      content: content,
    };
  }

  mkdir(path) {
    const targetPath = this.resolvePath(path);
    const parentPath = this.getParentPath(targetPath);
    const dirName = this.getBaseName(targetPath);

    // Special case for root
    if (targetPath === "/") return;

    // Ensure parent directory exists
    const parent = this.getNode(parentPath);
    if (!parent) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }

    if (parent.type !== "directory") {
      throw new Error(`Parent is not a directory: ${parentPath}`);
    }

    // Create directory if it doesn't exist
    if (!parent.children[dirName]) {
      parent.children[dirName] = {
        type: "directory",
        name: dirName,
        children: {},
      };
    }
  }

  getNode(path) {
    if (path === "/") return this.root;

    const parts = path.split("/").filter((part) => part);
    let current = this.root;

    for (const part of parts) {
      if (!current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  resolvePath(path) {
    // Handle absolute paths
    if (path.startsWith("/")) {
      return this.normalizePath(path);
    }

    // Handle relative paths
    return this.normalizePath(`${this.currentPath}/${path}`);
  }

  normalizePath(path) {
    const parts = path.split("/").filter((part) => part);
    const result = [];

    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") {
        if (result.length > 0) {
          result.pop();
        }
        continue;
      }
      result.push(part);
    }

    return `/${result.join("/")}`;
  }

  getParentPath(path) {
    const parts = path.split("/").filter((part) => part);
    if (parts.length === 0) return "/";
    parts.pop();
    return `/${parts.join("/")}`;
  }

  getBaseName(path) {
    const parts = path.split("/").filter((part) => part);
    if (parts.length === 0) return "";
    return parts[parts.length - 1];
  }
}

// ASCII Art for the app
const asciiArt = {
  terminal_logo: `███╗   ██╗███████╗ ██████╗ ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
████╗  ██║██╔════╝██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
██╔██╗ ██║█████╗  ██║   ██║   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
██║╚██╗██║██╔══╝  ██║   ██║   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
██║ ╚████║███████╗╚██████╔╝   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
╚═╝  ╚═══╝╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝`,
  hacker: `    .==.        .==.
    //\`\`\\      //^\\\\
   // ^ \\\\    // ^ \\\\
  //  ^\  \\\\  // ^ .\\\\
 //  ^  \\\\ \\\\ // ^  \\\\\\
// ^    ^\\\\ \\\\// ^    \\\\
\\\\ ^    ^ \\\\/\\/ ^     ^//
 \\\\ ^   ^ /\\\\ ^    ^ //
  \\\\^ ^ / \\\\\\ ^ ^ ^ //
   \\\\/ /   \\\\\\ ^ ^ /
    ==^     ^==
     ||     ||
     ||     ||
     ||     ||
      \\\\   //
       \\\\=//
        ^^^`,
  neural_network: `      ●
     /|\\
    ● ● ●
   /|\\|/|\\
  ● ● ● ● ●
 /|\\|/|\\|/|\\
● ● ● ● ● ● ●`,
};
