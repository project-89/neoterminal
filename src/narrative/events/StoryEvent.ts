/**
 * Represents an event that occurs in the narrative
 */
export interface StoryEvent {
  type: string;
  timestamp: number;
  details: Record<string, any>;
}

/**
 * Represents an event trigger that can cause narrative changes
 */
export interface EventTrigger {
  eventType: string;
  conditions?: {
    details?: Record<string, any>;
    playerState?: {
      minHackingSkill?: number;
      flags?: string[];
      inventory?: string[];
      factionStandings?: Record<string, number>;
    };
  };
  targetNode: string;
  priority?: number; // Higher priority triggers are evaluated first
  executeOnce?: boolean; // Whether this trigger should only activate once
}
