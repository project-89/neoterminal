# NEOTERMINAL // PHASE 1: CORE SYSTEM IMPLEMENTATION

```
██████╗ ██╗  ██╗ █████╗ ███████╗███████╗     ██╗
██╔══██╗██║  ██║██╔══██╗██╔════╝██╔════╝    ███║
██████╔╝███████║███████║███████╗█████╗      ╚██║
██╔═══╝ ██╔══██║██╔══██║╚════██║██╔══╝       ██║
██║     ██║  ██║██║  ██║███████║███████╗     ██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝     ╚═╝
```

## //> PHASE 1 OBJECTIVES

Phase 1 focuses on establishing the core foundation of the NEOTERMINAL system:

1. Create a functional terminal emulator with cyberpunk aesthetics
2. Implement the basic command interception and execution system
3. Develop the virtual filesystem foundation
4. Build initial skill tracking functionality
5. Establish the narrative framework and introductory missions
6. Set up the project architecture and development environment

## //> DEVELOPMENT TIMELINE: [12 WEEKS]

```
WEEK 1-2: Environment Setup & Core Architecture
WEEK 3-4: Terminal Emulator Implementation
WEEK 5-6: Command Processing System
WEEK 7-8: Basic Skill Tracking & Analysis
WEEK 9-10: Introductory Missions & Narrative
WEEK 11-12: Testing, Refinement & Documentation
```

## //> KEY DELIVERABLES

### 1. Project Scaffolding & Environment

**Directory Structure:**
```
neoterminal/
├── src/
│   ├── core/           # Core system components
│   ├── terminal/       # Terminal emulation
│   ├── commands/       # Command definitions
│   ├── missions/       # Mission system
│   ├── narrative/      # Story content
│   ├── skills/         # Skill tracking
│   ├── utils/          # Shared utilities
│   └── index.ts        # Application entry point
├── assets/             # Visual and audio assets
├── types/              # TypeScript type definitions
├── tests/              # Test suite
├── docs/               # Documentation
└── package.json        # Dependencies and scripts
```

**Initial Dependencies:**
- TypeScript & TSNode for development
- Xterm.js for terminal emulation
- Ink for terminal UI components
- Chalk for terminal styling
- Redux for state management
- Jest for testing
- ESLint & Prettier for code quality
- Electron for packaging

### 2. Terminal Nexus Implementation

**Core Components:**
- `TerminalEmulator`: Main terminal interface using xterm.js
- `InputHandler`: Processes keystrokes and command input
- `OutputRenderer`: Manages styled text output and formatting
- `CyberpunkTheme`: Visual styling and cyberpunk aesthetics
- `HistoryManager`: Tracks command history and provides navigation

**Key Interfaces:**

```typescript
// Terminal interface definition
interface ITerminal {
  initialize(): Promise<void>;
  write(content: string, style?: TerminalStyle): void;
  clear(): void;
  prompt(): void;
  handleInput(input: string): Promise<void>;
  registerCommandHandler(handler: CommandHandler): void;
  setTheme(theme: TerminalTheme): void;
}

// Terminal styling
interface TerminalStyle {
  foreground?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  blink?: boolean;
  inverse?: boolean;
}

// Cyberpunk theme definition
interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}
```

**Visual Elements:**
- Custom prompt design with hacker aesthetic
- Matrix-inspired animations for loading sequences
- ASCII art for mission briefings and key moments
- Custom cursor and selection styling
- Glitch effects for dramatic moments

### 3. Command System Implementation

**Core Components:**
- `CommandParser`: Processes and tokenizes input strings
- `CommandRegistry`: Stores available command definitions
- `CommandExecutor`: Handles command execution and output
- `CommandInterceptor`: Safely handles potentially dangerous commands
- `HelpSystem`: Provides contextual documentation

**Command Structure:**

```typescript
// Command definition
interface Command {
  name: string;
  aliases?: string[];
  category: CommandCategory;
  description: string;
  usage: string;
  examples: string[];
  skill_level: SkillLevel;
  execute(args: string[], options: CommandOptions): Promise<CommandResult>;
}

// Command categories
enum CommandCategory {
  NAVIGATION = "navigation",
  FILE_OPERATIONS = "file_operations",
  SYSTEM_INFO = "system_info",
  TEXT_PROCESSING = "text_processing",
  NETWORK = "network",
  UTILITY = "utility",
  ADVANCED = "advanced"
}

// Skill levels
enum SkillLevel {
  INITIATE = 1,
  OPERATOR = 2,
  NETRUNNER = 3,
  GHOST = 4,
  ARCHITECT = 5
}
```

**Initial Command Set (Tier 1):**
- `cd`: Change directory
- `ls`: List directory contents
- `pwd`: Print working directory
- `cat`: Display file contents
- `touch`: Create empty file
- `mkdir`: Create directory
- `rm`: Remove file or directory
- `help`: Access help system
- `man`: Display manual pages
- `clear`: Clear terminal
- `exit`: Exit current session or mission

### 4. Virtual Filesystem Implementation

**Core Components:**
- `VirtualFS`: Main filesystem abstraction
- `VirtualNode`: Base class for filesystem entities
- `VirtualDirectory`: Directory implementation
- `VirtualFile`: File implementation
- `FSOperation`: Abstract filesystem operations
- `PathResolver`: Handles path normalization and resolution

**Filesystem Structure:**

```typescript
// Base filesystem node
abstract class VirtualNode {
  name: string;
  parent: VirtualDirectory | null;
  permissions: FilePermissions;
  created: Date;
  modified: Date;
  accessed: Date;
  owner: string;
  group: string;
  
  abstract size(): number;
  abstract type(): string;
  abstract clone(): VirtualNode;
}

// Directory implementation
class VirtualDirectory extends VirtualNode {
  children: Map<string, VirtualNode>;
  
  addChild(node: VirtualNode): void;
  removeChild(name: string): boolean;
  getChild(name: string): VirtualNode | null;
  listChildren(): VirtualNode[];
}

// File implementation
class VirtualFile extends VirtualNode {
  content: Buffer;
  
  getContent(): Buffer;
  setContent(content: Buffer): void;
  appendContent(content: Buffer): void;
}

// File permissions
class FilePermissions {
  user: Permission;
  group: Permission;
  other: Permission;
  
  toString(): string; // Returns chmod-style string (e.g., "rwxr-xr--")
  fromString(permStr: string): void;
}

enum Permission {
  NONE = 0,      // ---
  EXECUTE = 1,   // --x
  WRITE = 2,     // -w-
  WRITE_EXEC = 3, // -wx
  READ = 4,      // r--
  READ_EXEC = 5, // r-x
  READ_WRITE = 6, // rw-
  ALL = 7        // rwx
}
```

**Initial Filesystem Structure:**
- `/home/user/`: User's home directory
- `/home/user/missions/`: Mission-related files
- `/home/user/docs/`: Documentation and tutorials
- `/home/user/tools/`: Tools and utilities
- `/sys/`: Simulated system files
- `/net/`: Simulated network connections
- `/data/`: Mission-specific data files

### 5. Skill Tracking System

**Core Components:**
- `SkillTracker`: Monitors command usage and proficiency
- `SkillProfile`: Stores user's skill levels across categories
- `CommandMetrics`: Records execution time, frequency, and correctness
- `ProficiencyCalculator`: Determines skill level based on metrics
- `LearningRecommender`: Suggests commands to practice

**Skill Tracking Structure:**

```typescript
// User skill profile
interface SkillProfile {
  userId: string;
  overall_level: SkillLevel;
  category_levels: Map<CommandCategory, number>;
  command_proficiency: Map<string, CommandProficiency>;
  missions_completed: string[];
  last_updated: Date;
}

// Command proficiency metrics
interface CommandProficiency {
  command: string;
  execution_count: number;
  successful_executions: number;
  average_execution_time: number;
  last_used: Date;
  proficiency_score: number; // 0-100
  common_errors: string[];
}

// Skill assessment event
interface SkillEvent {
  command: string;
  timestamp: Date;
  execution_time: number;
  successful: boolean;
  error_message?: string;
  context: string; // e.g., "mission_3", "tutorial", "free_exploration"
}
```

**Proficiency Calculation:**
- Track command frequency and recency
- Measure execution speed improvement over time
- Record syntax error frequency
- Assess command option familiarity
- Track command variation usage (different flags/parameters)

### 6. Narrative Engine Foundation

**Core Components:**
- `StoryEngine`: Manages narrative progression
- `DialogueManager`: Handles character conversations
- `MissionBriefing`: Formats mission information
- `StoryNode`: Represents a narrative point
- `StoryCondition`: Governs narrative branching

**Narrative Structure:**

```typescript
// Story node
interface StoryNode {
  id: string;
  title: string;
  content: string;
  ascii_art?: string;
  characters: Character[];
  choices?: StoryChoice[];
  conditions?: StoryCondition[];
  mission_unlock?: string;
  next_node?: string;
}

// Story choice (for branching narrative)
interface StoryChoice {
  text: string;
  next_node: string;
  conditions?: StoryCondition[];
}

// Condition types for story progression
type StoryCondition = 
  | { type: "mission_complete", mission_id: string }
  | { type: "skill_level", category: CommandCategory, level: number }
  | { type: "command_used", command: string, count: number }
  | { type: "item_acquired", item_id: string };

// Character definition
interface Character {
  id: string;
  name: string;
  role: string;
  ascii_portrait: string;
  text_color: string;
}
```

**Initial Narrative Content:**
- Creation of 3-5 main characters (ASCII art portraits)
- Introductory storyline establishing the cyberpunk world
- Tutorial framed as "recruitment" into hacker collective
- Initial mission sequence with basic objectives
- Establishment of the main antagonist (megacorporation)

### 7. Mission System Foundation

**Core Components:**
- `MissionManager`: Tracks available and completed missions
- `MissionTemplate`: Defines mission parameters and objectives
- `ObjectiveValidator`: Confirms objective completion
- `MissionEnvironment`: Sets up filesystem for mission
- `MissionReward`: Defines mission completion benefits

**Mission Structure:**

```typescript
// Mission definition
interface Mission {
  id: string;
  title: string;
  description: string;
  briefing: string;
  debriefing: string;
  ascii_art: string;
  difficulty: number; // 1-5
  estimated_time: number; // minutes
  objectives: MissionObjective[];
  environment: MissionEnvironment;
  rewards: MissionReward[];
  required_skill_level: SkillLevel;
  required_commands: string[];
  next_missions?: string[];
}

// Mission objective types
type MissionObjective =
  | { type: "execute_command", command: string, args?: string, count?: number }
  | { type: "create_file", path: string, content?: string }
  | { type: "modify_file", path: string, content_match?: RegExp }
  | { type: "find_file", path: string }
  | { type: "custom", description: string, validator: () => boolean };

// Mission environment
interface MissionEnvironment {
  filesystem: VirtualFilesystemSnapshot;
  variables: Record<string, string>;
  network_nodes?: NetworkNode[];
}

// Mission reward types
type MissionReward =
  | { type: "skill_points", category: CommandCategory, points: number }
  | { type: "unlock_command", command: string }
  | { type: "unlock_area", path: string }
  | { type: "story_progression", node_id: string };
```

**Initial Missions:**
1. **System Calibration**: Tutorial mission introducing basic navigation
2. **Data Retrieval**: Find and read specific files
3. **Digital Footprints**: Create and modify files
4. **Ghost Protocol**: Practice removing traces (deleting files)
5. **Directory Maze**: Navigate complex directory structures

## //> IMPLEMENTATION PRIORITIES

### Week 1-2: Environment Setup
- [ ] Create project repository and structure
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint and Prettier
- [ ] Implement CI/CD pipeline
- [ ] Create development documentation
- [ ] Set up test environment

### Week 3-4: Terminal Emulator
- [ ] Implement basic terminal with xterm.js
- [ ] Create cyberpunk styling and theme
- [ ] Add input handling and command history
- [ ] Implement ASCII art renderer
- [ ] Add typing sounds and visual effects
- [ ] Create custom cursor and selection styling

### Week 5-6: Command System
- [ ] Implement command parser and tokenizer
- [ ] Create command registry and execution pipeline
- [ ] Implement 10 basic Tier 1 commands
- [ ] Create help system and documentation
- [ ] Add command history and autocomplete
- [ ] Implement command interception for system protection

### Week 7-8: Virtual Filesystem & Skill Tracking
- [ ] Implement virtual filesystem core classes
- [ ] Create initial filesystem structure
- [ ] Implement path resolution and navigation
- [ ] Add file content management
- [ ] Implement skill tracking foundation
- [ ] Create metrics collection for command usage
- [ ] Implement basic proficiency calculation

### Week 9-10: Narrative & Mission System
- [ ] Create story engine foundation
- [ ] Design 3-5 main characters with ASCII portraits
- [ ] Write introductory narrative sequence
- [ ] Implement mission manager and template system
- [ ] Create objective validation framework
- [ ] Develop 5 introductory missions
- [ ] Integrate narrative with command learning curve

### Week 11-12: Testing & Refinement
- [ ] Conduct user experience testing
- [ ] Optimize terminal performance
- [ ] Fix identified bugs and issues
- [ ] Polish visual elements and styling
- [ ] Create comprehensive documentation
- [ ] Package application for distribution
- [ ] Prepare for Phase 2 development

## //> CODE SPECIFICATIONS

### Terminal Emulator Core Component

```typescript
// src/terminal/TerminalEmulator.ts

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { cyberpunkTheme } from './themes/cyberpunk';
import { CommandProcessor } from '../core/CommandProcessor';
import { EventEmitter } from 'events';

export class TerminalEmulator extends EventEmitter {
  private terminal: Terminal;
  private fitAddon: FitAddon;
  private commandProcessor: CommandProcessor;
  private inputBuffer: string = '';
  private cursorPosition: number = 0;
  private commandHistory: string[] = [];
  private historyPosition: number = -1;
  private prompt: string = '>';

  constructor(containerId: string, commandProcessor: CommandProcessor) {
    super();
    this.commandProcessor = commandProcessor;
    
    // Initialize xterm.js terminal
    this.terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: cyberpunkTheme,
      allowTransparency: true,
      rendererType: 'canvas'
    });
    
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.loadAddon(new WebLinksAddon());
    
    // Mount terminal to container
    this.terminal.open(document.getElementById(containerId)!);
    this.fitAddon.fit();
    
    // Add event listeners
    window.addEventListener('resize', () => this.fitAddon.fit());
    this.terminal.onData(this.handleTerminalData.bind(this));
    
    // Initial terminal content
    this.displayWelcomeScreen();
    this.displayPrompt();
  }
  
  private handleTerminalData(data: string): void {
    const code = data.charCodeAt(0);
    
    // Handle special keys
    if (code === 13) { // Enter
      this.terminal.write('\r\n');
      this.processCommand();
    } else if (code === 127) { // Backspace
      if (this.cursorPosition > 0) {
        this.cursorPosition--;
        this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + 
                          this.inputBuffer.slice(this.cursorPosition + 1);
        // Update display
        this.terminal.write('\b \b');
      }
    } else if (code === 27) { // Arrow keys, etc.
      // Handle arrow navigation, history, etc.
      if (data === '\u001b[A') { // Up arrow
        this.navigateHistory(-1);
      } else if (data === '\u001b[B') { // Down arrow
        this.navigateHistory(1);
      }
    } else {
      // Regular character input
      this.inputBuffer = this.inputBuffer.slice(0, this.cursorPosition) + 
                        data + 
                        this.inputBuffer.slice(this.cursorPosition);
      this.cursorPosition += data.length;
      this.terminal.write(data);
    }
  }
  
  private processCommand(): void {
    const command = this.inputBuffer.trim();
    this.inputBuffer = '';
    this.cursorPosition = 0;
    
    if (command.length > 0) {
      // Add to history
      this.commandHistory.push(command);
      this.historyPosition = this.commandHistory.length;
      
      // Process command
      this.commandProcessor.process(command)
        .then(result => {
          if (result.output) {
            this.writeOutput(result.output);
          }
          this.emit('command-executed', { command, result });
          this.displayPrompt();
        })
        .catch(error => {
          this.writeError(error.message);
          this.displayPrompt();
        });
    } else {
      this.displayPrompt();
    }
  }
  
  private navigateHistory(direction: number): void {
    // Calculate new history position
    const newPosition = this.historyPosition + direction;
    
    if (newPosition >= 0 && newPosition <= this.commandHistory.length) {
      // Clear current input
      this.terminal.write('\u001b[2K\r');
      this.displayPrompt();
      
      // Set new history position
      this.historyPosition = newPosition;
      
      if (newPosition < this.commandHistory.length) {
        // Display command from history
        const historyCommand = this.commandHistory[newPosition];
        this.inputBuffer = historyCommand;
        this.cursorPosition = historyCommand.length;
        this.terminal.write(historyCommand);
      } else {
        // Clear input buffer at end of history
        this.inputBuffer = '';
        this.cursorPosition = 0;
      }
    }
  }
  
  public writeOutput(output: string): void {
    this.terminal.write(`\r\n${output}\r\n`);
  }
  
  public writeError(message: string): void {
    this.terminal.write(`\r\n\u001b[31mERROR: ${message}\u001b[0m\r\n`);
  }
  
  public displayPrompt(): void {
    this.terminal.write(`\r\n\u001b[36m${this.prompt}\u001b[0m `);
  }
  
  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }
  
  public clear(): void {
    this.terminal.clear();
  }
  
  private displayWelcomeScreen(): void {
    // Display ASCII art logo and intro text
    const welcomeArt = `
\u001b[36m _   _ _____ ___ _____ ___ ____  __  __ ___ _   _    _    _     
| \\ | | ____|  _ \\_   _| __| __ \\|  \\/  |_ _| \\ | |  / \\  | |    
|  \\| |  _| | |_) || | |  _|  __/| |\\/| || ||  \\| | / _ \\ | |    
| |\\  | |___| | | || | | |_| |  || |  | || || |\\  |/ ___ \\| |___ 
|_| \\_|_____|_| |_||_| |___|_|  |_|  |_|___|_| \\_/_/   \\_\\_____|
\u001b[0m
\u001b[33m>> SYSTEM v0.1.0 - INITIALIZING...
>> ESTABLISHING SECURE CONNECTION...
>> WELCOME, OPERATIVE.
\u001b[0m`;

    this.terminal.write(welcomeArt);
  }
}
```

### Command Processor Implementation

```typescript
// src/core/CommandProcessor.ts

import { CommandRegistry } from './CommandRegistry';
import { VirtualFileSystem } from '../filesystem/VirtualFileSystem';
import { SkillTracker } from '../skills/SkillTracker';
import { EventEmitter } from 'events';

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

export class CommandProcessor extends EventEmitter {
  private commandRegistry: CommandRegistry;
  private fileSystem: VirtualFileSystem;
  private skillTracker: SkillTracker;
  
  constructor(
    commandRegistry: CommandRegistry,
    fileSystem: VirtualFileSystem,
    skillTracker: SkillTracker
  ) {
    super();
    this.commandRegistry = commandRegistry;
    this.fileSystem = fileSystem;
    this.skillTracker = skillTracker;
  }
  
  public async process(input: string): Promise<CommandResult> {
    const startTime = performance.now();
    
    try {
      // Parse command and arguments
      const [commandName, ...args] = this.parseCommandLine(input);
      
      // Find command in registry
      const command = this.commandRegistry.getCommand(commandName);
      
      if (!command) {
        return {
          success: false,
          error: `Command not found: ${commandName}`,
          executionTime: performance.now() - startTime
        };
      }
      
      // Execute command
      const result = await command.execute(args, {
        currentDirectory: this.fileSystem.getCurrentDirectory(),
        filesystem: this.fileSystem,
        env: process.env
      });
      
      // Track command usage for skill analysis
      this.skillTracker.recordCommandExecution({
        command: commandName,
        args,
        timestamp: new Date(),
        executionTime: performance.now() - startTime,
        successful: result.success,
        errorMessage: result.error
      });
      
      return {
        ...result,
        executionTime: performance.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: performance.now() - startTime
      };
    }
  }
  
  private parseCommandLine(input: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (const char of input) {
      if (escapeNext) {
        current += char;
        escapeNext = false;
      } else if (char === '\\') {
        escapeNext = true;
      } else if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    return parts;
  }
}
```

### Virtual Filesystem Base Implementation

```typescript
// src/filesystem/VirtualFileSystem.ts

import { VirtualNode, VirtualDirectory, VirtualFile } from './VirtualNodes';
import { EventEmitter } from 'events';

export class VirtualFileSystem extends EventEmitter {
  private root: VirtualDirectory;
  private currentDirectory: VirtualDirectory;
  
  constructor() {
    super();
    this.root = new VirtualDirectory('/', null);
    this.currentDirectory = this.root;
    
    // Initialize basic filesystem structure
    this.initializeFileSystem();
  }
  
  private initializeFileSystem(): void {
    // Create basic directory structure
    const home = this.mkdir('/home');
    const user = this.mkdir('/home/user');
    this.mkdir('/home/user/missions');
    this.mkdir('/home/user/docs');
    this.mkdir('/home/user/tools');
    this.mkdir('/sys');
    this.mkdir('/net');
    this.mkdir('/data');
    
    // Set initial current directory to user's home
    this.currentDirectory = user as VirtualDirectory;
    
    // Create some initial files
    this.writeFile('/home/user/README.txt', 
      'WELCOME TO NEOTERMINAL\n\n' +
      'You have been recruited by GHOST//SIGNAL, a hacktivist collective\n' +
      'fighting against corporate control of cyberspace.\n\n' +
      'Type "help" for a list of available commands.\n' +
      'Type "missions" to view your current objectives.\n'
    );
  }
  
  public getCurrentDirectory(): VirtualDirectory {
    return this.currentDirectory;
  }
  
  public setCurrentDirectory(directory: VirtualDirectory): void {
    this.currentDirectory = directory;
    this.emit('directory-changed', { path: this.getCurrentPath() });
  }
  
  public getCurrentPath(): string {
    const parts: string[] = [];
    let dir: VirtualDirectory | null = this.currentDirectory;
    
    while (dir !== null) {
      parts.unshift(dir.name);
      dir = dir.parent;
    }
    
    return parts.join('/').replace('//', '/') || '/';
  }
  
  public resolvePath(path: string): string {
    // Convert path to absolute
    let absolutePath: string;
    
    if (path.startsWith('/')) {
      absolutePath = path;
    } else {
      absolutePath = `${this.getCurrentPath()}/${path}`;
    }
    
    // Normalize path
    const parts = absolutePath.split('/').filter(Boolean);
    const result: string[] = [];
    
    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '..') {
        result.pop();
      } else {
        result.push(part);
      }
    }
    
    return `/${result.join('/')}`;
  }
  
  public getNode(path: string): VirtualNode | null {
    const resolvedPath = this.resolvePath(path);
    const parts = resolvedPath.split('/').filter(Boolean);
    
    let current: VirtualNode = this.root;
    
    for (const part of parts) {
      if (!(current instanceof VirtualDirectory)) {
        return null;
      }
      
      const child = current.getChild(part);
      
      if (!child) {
        return null;
      }
      
      current = child;
    }
    
    return current;
  }
  
  public mkdir(path: string): VirtualNode {
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    const directoryName = path.split('/').pop() || '';
    
    if (!directoryName) {
      throw new Error('Invalid directory name');
    }
    
    // Get parent directory
    const parent = this.getNode(parentPath);
    
    if (!parent || !(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }
    
    // Check if directory already exists
    if (parent.getChild(directoryName)) {
      throw new Error(`Directory already exists: ${path}`);
    }
    
    // Create directory
    const directory = new VirtualDirectory(directoryName, parent);
    parent.addChild(directory);
    
    this.emit('node-created', { path, node: directory });
    
    return directory;
  }
  
  public writeFile(path: string, content: string): VirtualNode {
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    const fileName = path.split('/').pop() || '';
    
    if (!fileName) {
      throw new Error('Invalid file name');
    }
    
    // Get parent directory
    const parent = this.getNode(parentPath);
    
    if (!parent || !(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }
    
    // Check if file exists
    let file = parent.getChild(fileName);
    
    if (file && !(file instanceof VirtualFile)) {
      throw new Error(`Path exists but is not a file: ${path}`);
    }
    
    if (!file) {
      // Create new file
      file = new VirtualFile(fileName, parent);
      parent.addChild(file);
      this.emit('node-created', { path, node: file });
    }
    
    // Update file content
    (file as VirtualFile).setContent(Buffer.from(content));
    this.emit('node-modified', { path, node: file });
    
    return file;
  }
  
  public readFile(path: string): Buffer {
    const node = this.getNode(path);
    
    if (!node) {
      throw new Error(`File not found: ${path}`);
    }
    
    if (!(node instanceof VirtualFile)) {
      throw new Error(`Path is not a file: ${path}`);
    }
    
    node.accessed = new Date();
    this.emit('node-accessed', { path, node });
    
    return node.getContent();
  }
  
  public deleteNode(path: string): void {
    const resolvedPath = this.resolvePath(path);
    const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
    const nodeName = resolvedPath.split('/').pop() || '';
    
    // Cannot delete root
    if (!nodeName) {
      throw new Error('Cannot delete root directory');
    }
    
    // Get parent directory
    const parent = this.getNode(parentPath);
    
    if (!parent || !(parent instanceof VirtualDirectory)) {
      throw new Error(`Parent directory not found: ${parentPath}`);
    }
    
    // Check if node exists
    const node = parent.getChild(nodeName);
    
    if (!node) {
      throw new Error(`Node not found: ${path}`);
    }
    
    // Delete node
    parent.removeChild(nodeName);
    this.emit('node-deleted', { path: resolvedPath });
  }
}
```

## //> TESTING STRATEGY

### Unit Testing

Focus on testing individual components in isolation:

1. **Command Parsing and Execution**
   - Validate command parsing accuracy
   - Test argument handling and option processing
   - Verify command execution results

2. **Virtual Filesystem**
   - Test path resolution and normalization
   - Verify file creation, reading, and modification
   - Test directory navigation and listing
   - Validate permission checks

3. **Skill Tracking**
   - Test proficiency calculations
   - Verify event recording and processing
   - Test learning path generation

### Integration Testing

Test interactions between subsystems:

1. **Terminal to Command Processing**
   - Verify input handling and command execution flow
   - Test command history and navigation
   - Validate output formatting and display

2. **Command Execution to Filesystem**
   - Test filesystem operations through command interface
   - Verify correct error handling and reporting

3. **Skill Tracking to Mission Selection**
   - Test skill-based mission recommendations
   - Verify appropriate difficulty progression

### End-to-End Testing

Simulate complete user scenarios:

1. **Complete Missions**
   - Play through initial missions
   - Verify objective validation
   - Test mission rewards and progression

2. **Learning Progression**
   - Verify command mastery tracking
   - Test learning path adaptation
   - Validate skill level advancement

## //> KEY RISK FACTORS

1. **Terminal Performance**: Ensure responsive typing and command execution
2. **Learning Curve Balance**: Avoid frustration while maintaining challenge
3. **Narrative Integration**: Ensure story enhances rather than obstructs learning
4. **Command Simulation Accuracy**: Faithfully reproduce important CLI behaviors
5. **Cross-Platform Compatibility**: Ensure consistent experience across operating systems

## //> PHASE 1 SUCCESS CRITERIA

- Terminal emulator functions with >98% reliability
- All Tier 1 commands implemented and working correctly
- Virtual filesystem supports basic operations reliably
- Skill tracking accurately identifies command usage patterns
- Introductory narrative establishes cyberpunk setting
- First 5 missions playable with clear objectives
- Basic UI has cyberpunk aesthetic
- Documentation complete for all Phase 1 features

---

```
// END OF PHASE 1 DOCUMENTATION
// CLEARANCE: OPERATIVE
// PREPARING FOR PHASE 2 IMPLEMENTATION...
```