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
  requirements?: {
    // Requirements for the node to be accessible
    minHackingSkill?: number;
    requiredItems?: string[];
    requiredFlags?: string[];
    factionStandings?: Record<string, number>;
    completedMissions?: string[];
  };
  effects?: NodeEffect[]; // Effects on player state
  metadata?: {
    // Additional metadata for the node
    author?: string;
    created?: number;
    modified?: number;
    notes?: string;
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
    | "add_event";
  // Properties for different effect types
  stat?: string;
  value?: number;
  item?: string;
  flag?: string;
  faction?: string;
  key?: string;
  eventType?: string;
  details?: Record<string, any>;
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
