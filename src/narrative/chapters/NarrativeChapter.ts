/**
 * Represents a chapter in the narrative
 */
export interface NarrativeChapter {
  id: string;
  title: string;
  description: string;
  order: number; // The sequence in the overall story
  startingNodeId: string; // Entry point for this chapter
  endingNodeIds: string[]; // Possible ending nodes for this chapter
  unlockRequirements?: {
    // Requirements to unlock this chapter
    completedChapters?: string[];
    playerLevel?: number;
    flags?: string[];
  };
  metadata?: {
    author?: string;
    estimatedDuration?: number; // In minutes
    difficulty?: number; // 1-5 scale
    tags?: string[];
  };
}
