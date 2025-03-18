// Command categories
export enum CommandCategory {
  NAVIGATION = "navigation",
  FILE_OPERATIONS = "file_operations",
  SYSTEM_INFO = "system_info",
  TEXT_PROCESSING = "text_processing",
  NETWORK = "network",
  UTILITY = "utility",
  ADVANCED = "advanced",
}

// Skill levels
export enum SkillLevel {
  INITIATE = 1,
  OPERATOR = 2,
  NETRUNNER = 3,
  GHOST = 4,
  ARCHITECT = 5,
}

// Command definition
export interface Command {
  name: string;
  aliases?: string[];
  category: CommandCategory;
  description: string;
  usage: string;
  examples: string[];
  skillLevel: SkillLevel;
  execute(args: string[], options: CommandOptions): Promise<CommandResult>;
}

// Command options provided during execution
export interface CommandOptions {
  currentDirectory: string;
  filesystem: any; // Will be typed properly once FileSystem is implemented
  env: Record<string, string>;
  terminal?: any; // Terminal instance for special commands that need rendering capabilities
}

// Command execution result
export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
}

// Terminal styling
export interface TerminalStyle {
  foreground?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  blink?: boolean;
  inverse?: boolean;
}

// Terminal theme definition
export interface TerminalTheme {
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

// Skill event for tracking user command usage
export interface SkillEvent {
  command: string;
  args?: string[];
  timestamp: Date;
  executionTime: number;
  successful: boolean;
  errorMessage?: string;
  context?: string;
}

// User skill profile
export interface SkillProfile {
  userId: string;
  overallLevel: SkillLevel;
  categoryLevels: Map<CommandCategory, number>;
  commandProficiency: Map<string, CommandProficiency>;
  missionsCompleted: string[];
  lastUpdated: Date;
}

// Command proficiency metrics
export interface CommandProficiency {
  command: string;
  executionCount: number;
  successfulExecutions: number;
  averageExecutionTime: number;
  lastUsed: Date;
  proficiencyScore: number; // 0-100
  commonErrors: string[];
}

// Story/Mission related types
export interface StoryNode {
  id: string;
  title: string;
  content: string;
  asciiArt?: string;
  characters: Character[];
  choices?: StoryChoice[];
  conditions?: StoryCondition[];
  missionUnlock?: string;
  nextNode?: string;
}

export interface StoryChoice {
  text: string;
  nextNode: string;
  conditions?: StoryCondition[];
}

export type StoryCondition =
  | { type: "mission_complete"; missionId: string }
  | { type: "skill_level"; category: CommandCategory; level: number }
  | { type: "command_used"; command: string; count: number }
  | { type: "item_acquired"; itemId: string };

export interface Character {
  id: string;
  name: string;
  role: string;
  asciiPortrait: string;
  textColor: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  briefing: string;
  debriefing: string;
  asciiArt: string;
  difficulty: number; // 1-5
  estimatedTime: number; // minutes
  objectives: MissionObjective[];
  environment: MissionEnvironment;
  rewards: MissionReward[];
  requiredSkillLevel: SkillLevel;
  requiredCommands: string[];
  nextMissions?: string[];
}

export type MissionObjective =
  | { type: "execute_command"; command: string; args?: string; count?: number }
  | { type: "create_file"; path: string; content?: string }
  | { type: "modify_file"; path: string; contentMatch?: RegExp }
  | { type: "find_file"; path: string }
  | { type: "custom"; description: string; validator: () => boolean };

export interface MissionEnvironment {
  filesystem: any; // Will be typed properly once FileSystem is implemented
  variables: Record<string, string>;
  networkNodes?: any[]; // Will be typed properly later
}

export type MissionReward =
  | { type: "skill_points"; category: CommandCategory; points: number }
  | { type: "unlock_command"; command: string }
  | { type: "unlock_area"; path: string }
  | { type: "story_progression"; nodeId: string };
