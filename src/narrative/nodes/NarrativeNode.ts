/**
 * Represents a node in the narrative, containing content and choices
 */
export interface NarrativeNode {
  /** Unique identifier for the node */
  id: string;

  /** Title of this narrative node */
  title: string;

  /** Main narrative content displayed to the player */
  content: string;

  /** ID of the chapter this node belongs to */
  chapterId: string;

  /** ID of speaking character (if applicable) */
  speakerId?: string;

  /** Array of choices available to the player */
  choices?: NarrativeChoice[];

  /** Special node effects that trigger on entering this node */
  onEnterEffects?: NodeEffect[];

  /** Special node effects that trigger when leaving this node */
  onExitEffects?: NodeEffect[];

  /** Conditions that must be met to access this node */
  requirements?: {
    /** Player level required */
    playerLevel?: number;

    /** Items required in inventory */
    requiredItems?: string[];

    /** Skills required (with minimum levels) */
    requiredSkills?: Record<string, number>;

    /** Game flags that must be active */
    flags?: string[];
  };

  /** Additional node properties */
  metadata?: {
    /** Background image or scene */
    background?: string;

    /** Ambient sound to play */
    ambientSound?: string;

    /** Music track to play */
    music?: string;

    /** UI theme to use */
    theme?: string;

    /** Whether this is a special node (like chapter start/end) */
    isSpecialNode?: boolean;

    /** Custom node tags */
    tags?: string[];

    /** Any other node-specific metadata */
    [key: string]: any;
  };
}

/**
 * Represents a choice the player can make in a narrative node
 */
export interface NarrativeChoice {
  /** Unique identifier for this choice */
  id: string;

  /** Text displayed to the player */
  text: string;

  /** ID of the node this choice leads to */
  nextNodeId: string;

  /** Whether this choice is initially visible to the player */
  isVisible: boolean;

  /** Conditions required to select this choice */
  requirements?: {
    /** Player level required */
    playerLevel?: number;

    /** Items required in inventory */
    requiredItems?: string[];

    /** Skills required (with minimum levels) */
    requiredSkills?: Record<string, number>;

    /** Game flags that must be active */
    flags?: string[];
  };

  /** Effects that trigger when this choice is selected */
  effects?: NodeEffect[];
}

/**
 * Represents a special effect that can occur in a narrative node
 */
export interface NodeEffect {
  /** Type of effect */
  type:
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

  /** Target of the effect (item ID, flag name, character ID, etc.) */
  target: string;

  /** Value associated with the effect */
  value?: any;

  /** Probability of the effect occurring (0-1, defaults to 1) */
  probability?: number;

  /** Message to display when effect occurs */
  message?: string;
}
