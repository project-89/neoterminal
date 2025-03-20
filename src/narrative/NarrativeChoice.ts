/**
 * Represents a choice that players can make in the narrative
 */
export interface NarrativeChoice {
  id: string;
  text: string;
  targetNode: string; // ID of the node this choice leads to
  requirements?: {
    // Requirements for this choice to be available
    minHackingSkill?: number;
    requiredItems?: string[];
    requiredFlags?: string[];
    factionStandings?: Record<string, number>;
  };
  effects?: ChoiceEffect[]; // Effects when this choice is selected
  metadata?: {
    tooltipText?: string; // Additional info shown on hover
    riskLevel?: "low" | "medium" | "high"; // Visual indicator of risk
    aiSuggested?: boolean; // Whether this choice was dynamically generated
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
    | "set_variable";
  // Properties for different effect types
  stat?: string;
  value?: number;
  item?: string;
  flag?: string;
  faction?: string;
  key?: string;
  stringValue?: string;
}
