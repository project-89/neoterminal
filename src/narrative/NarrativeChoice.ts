/**
 * Represents a choice that players can make in the narrative
 */
export interface NarrativeChoice {
  id: string;
  text: string;
  targetNode: string; // ID of the node this choice leads to
  nextNodeId?: string; // Alternative name for targetNode (for compatibility)
  isVisible?: boolean; // Whether the choice is initially visible to the player
  requires_command?: string; // Command that must be executed to enable this choice
  requirements?: {
    // Requirements for this choice to be available
    minHackingSkill?: number;
    requiredItems?: string[];
    requiredFlags?: string[];
    factionStandings?: Record<string, number>;
    playerLevel?: number; // For compatibility with nodes/NarrativeNode.ts
    requiredSkills?: Record<string, number>; // For compatibility with nodes/NarrativeNode.ts
    flags?: string[]; // For compatibility with nodes/NarrativeNode.ts
  };
  effects?: ChoiceEffect[]; // Effects when this choice is selected
  metadata?: {
    tooltipText?: string; // Additional info shown on hover
    riskLevel?: "low" | "medium" | "high"; // Visual indicator of risk
    aiSuggested?: boolean; // Whether this choice was dynamically generated
    commandChoice?: boolean; // Whether this choice requires typing a command
  };
}

/**
 * Effects that can be applied when a choice is made
 */
export interface ChoiceEffect {
  type:
    | "modify_stat"
    | "add_item"
    | "remove_item"
    | "set_flag"
    | "clear_flag"
    | "modify_faction"
    | "set_variable"
    | "ADD_FLAG" // For compatibility with nodes/NarrativeNode.ts
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
  stringValue?: string;
  target?: string; // For compatibility with nodes/NarrativeNode.ts
  message?: string; // For compatibility with nodes/NarrativeNode.ts
  probability?: number; // For compatibility with nodes/NarrativeNode.ts
}
