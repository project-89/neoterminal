import { NarrativeChoice } from "./NarrativeChoice";

/**
 * Represents a node in the narrative graph
 */
export interface NarrativeNode {
  id: string;
  type: "narrative" | "dialogue" | "choice" | "mission" | "event";
  title?: string;
  chapterId?: string; // Reference to the chapter this node belongs to
  content?: string; // Static content or null if AI-generated
  dynamicContent?: boolean; // Whether to use AI to generate content
  choices?: NarrativeChoice[]; // Available choices for the player
  next?: string; // ID of the next node (if linear)
  characters?: string[]; // Character IDs present in this node
  location?: string; // Location ID where this node takes place
  tags?: string[]; // Tags for search and filtering
  requires_command?: string; // Command that must be executed to progress

  // Additional properties from nodes/NarrativeNode.ts for compatibility
  speakerId?: string; // ID of speaking character
  onEnterEffects?: NodeEffect[]; // Effects when entering node
  onExitEffects?: NodeEffect[]; // Effects when leaving node

  requirements?: {
    // Requirements for the node to be accessible
    minHackingSkill?: number;
    requiredItems?: string[];
    requiredFlags?: string[];
    factionStandings?: Record<string, number>;
    completedMissions?: string[];
    playerLevel?: number; // From nodes/NarrativeNode.ts
    requiredSkills?: Record<string, number>; // From nodes/NarrativeNode.ts
    flags?: string[]; // From nodes/NarrativeNode.ts
  };
  effects?: NodeEffect[]; // Effects on player state
  metadata?: {
    // Additional metadata for the node
    author?: string;
    created?: number;
    modified?: number;
    notes?: string;

    // From nodes/NarrativeNode.ts metadata
    background?: string; // Background image or scene
    ambientSound?: string; // Ambient sound to play
    music?: string; // Music track to play
    theme?: string; // UI theme to use
    isSpecialNode?: boolean; // Whether this is a special node
    tags?: string[]; // Tags for the node (duplicate of node.tags for compatibility)
    [key: string]: any; // Allow any other metadata properties
  };
}

/**
 * Effects that can be applied when a node is processed
 */
export interface NodeEffect {
  type:
    | "modify_stat"
    | "add_item"
    | "remove_item"
    | "set_flag"
    | "clear_flag"
    | "modify_faction"
    | "set_variable"
    | "add_event"
    | "ADD_FLAG"
    | "REMOVE_FLAG"
    | "ADD_ITEM"
    | "REMOVE_ITEM"
    | "MODIFY_RELATIONSHIP"
    | "CHANGE_STAT"
    | "TRIGGER_EVENT"
    | "UNLOCK_CHAPTER"
    | "COMPLETE_OBJECTIVE"
    | "CUSTOM";
  // Properties for different effect types
  stat?: string;
  value?: number;
  item?: string;
  flag?: string;
  faction?: string;
  key?: string;
  eventType?: string;
  details?: Record<string, any>;

  // From nodes/NarrativeNode.ts NodeEffect
  target?: string; // Target of the effect
  message?: string; // Message to display
  probability?: number; // Probability of occurrence
}

/**
 * Types of nodes in the narrative system
 */
export enum NarrativeNodeType {
  NARRATIVE = "narrative", // Story text
  DIALOGUE = "dialogue", // Character conversation
  CHOICE = "choice", // Decision point
  MISSION = "mission", // Mission-related node
  EVENT = "event", // Event-triggered node
}
